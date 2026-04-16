<script>
import { mapActions } from 'pinia'
import { useOrderStore } from '@/stores/order-store'
import { useSocketStore } from '@/stores/socket-store'
import PageHeader from '@/components/page-header.vue'
import { ChevronRight, Pencil } from 'lucide-vue-next'

export default {
  name: 'OrderDetailView',
  components: { PageHeader, ChevronRight, Pencil },
  data() {
    return {
      order: null,
      editing: false,
      editForm: {
        state: '',
        origin: '',
        destination: '',
        deliveryDate: '',
      },
      errorMessage: '',
    }
  },
  computed: {
    orderId() {
      return this.$route.params.orderId
    },
    orderBadgeClass() {
      return {
        PENDING: 'kl-badge kl-badge--warning',
        IN_PROCESS: 'kl-badge kl-badge--info',
        DELIVERED: 'kl-badge kl-badge--primary',
      }[this.order?.state] || 'kl-badge kl-badge--muted'
    },
    totalWeight() {
      if (!this.order) return 0
      return this.order.cargos.reduce(
        (sum, c) => sum + Number(c.quantity || 0) * Number(c.weight || 0),
        0,
      )
    },
  },
  methods: {
    ...mapActions(useOrderStore, ['getOrderById', 'updateOrder']),
    ...mapActions(useSocketStore, ['joinOrderRoom', 'leaveOrderRoom', 'getSocket']),
    async loadOrder() {
      try {
        this.order = await this.getOrderById(this.orderId)
      } catch (e) {
        this.errorMessage = e.response?.data?.error || 'Order not found'
      }
    },
    handleOrderUpdate(updatedOrder) {
      if (updatedOrder._id === this.orderId) {
        this.order = updatedOrder
        if (this.editing) {
          this.editing = false
        }
      }
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString(undefined, {
        weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
      })
    },
    formatDateInput(date) {
      return new Date(date).toISOString().split('T')[0]
    },
    startEdit() {
      this.editForm = {
        state: this.order.state,
        origin: this.order.origin,
        destination: this.order.destination,
        deliveryDate: this.formatDateInput(this.order.deliveryDate),
      }
      this.editing = true
    },
    cancelEdit() {
      this.editing = false
      this.errorMessage = ''
    },
    async saveEdit() {
      this.errorMessage = ''
      try {
        await this.updateOrder(this.orderId, this.editForm)
        await this.loadOrder()
        this.editing = false
      } catch (e) {
        this.errorMessage = e.response?.data?.error || e.message
      }
    },
  },
  async mounted() {
    await this.loadOrder()
    this.joinOrderRoom(this.orderId)
    const socket = this.getSocket()
    if (socket) {
      socket.on('order:updated', this.handleOrderUpdate)
    }
  },
  beforeUnmount() {
    this.leaveOrderRoom(this.orderId)
    const socket = this.getSocket()
    if (socket) {
      socket.off('order:updated', this.handleOrderUpdate)
    }
  },
}
</script>

<template>
  <div class="order-detail">
    <PageHeader
      :title="order ? `Order #${order._id.slice(-5)}` : 'Order'"
      subtitle="Live transport order details."
      back-to="/orders"
      back-label="Back to orders"
    >
      <template v-if="order && !editing && order.state === 'PENDING'" #actions>
        <button type="button" class="kl-btn kl-btn--outline" @click="startEdit">
          <Pencil :size="14" :stroke-width="1.75" /> Edit order
        </button>
      </template>
    </PageHeader>

    <div v-if="errorMessage" class="kl-alert kl-alert--danger">{{ errorMessage }}</div>

    <template v-if="order">
      <div class="detail-grid">
        <!-- Route & status card -->
        <section class="kl-card kl-card--padded detail-main">
          <div class="detail-main__head">
            <div>
              <div class="kl-muted tiny-label">Transport status</div>
              <div class="detail-main__state">
                <span :class="orderBadgeClass">{{ order.state }}</span>
              </div>
            </div>
            <div class="detail-id">#{{ order._id.slice(-5) }}</div>
          </div>

          <div class="route">
            <div class="route__point">
              <div class="route__dot" />
              <div>
                <div class="route__label">Origin</div>
                <div class="route__value">{{ order.origin }}</div>
              </div>
            </div>
            <div class="route__line" aria-hidden="true">
              <ChevronRight :size="18" :stroke-width="1.75" />
            </div>
            <div class="route__point route__point--end">
              <div class="route__dot route__dot--end" />
              <div>
                <div class="route__label">Destination</div>
                <div class="route__value">{{ order.destination }}</div>
              </div>
            </div>
          </div>

          <div class="info-grid">
            <div>
              <div class="tiny-label">Delivery date</div>
              <div class="info-value">{{ formatDate(order.deliveryDate) }}</div>
            </div>
            <div>
              <div class="tiny-label">Cargo items</div>
              <div class="info-value">{{ order.cargos.length }}</div>
            </div>
            <div>
              <div class="tiny-label">Total weight</div>
              <div class="info-value">{{ totalWeight }} kg</div>
            </div>
            <div v-if="order.customer">
              <div class="tiny-label">Customer</div>
              <div class="info-value">{{ order.customer.customerName || order.customer }}</div>
            </div>
          </div>
        </section>

        <!-- Cargo -->
        <section class="kl-card kl-card--flush">
          <div class="kl-card-header">
            <h3>Cargo ({{ order.cargos.length }})</h3>
          </div>
          <div class="cargo-list">
            <div
              v-for="(cargo, idx) in order.cargos"
              :key="idx"
              class="cargo-card"
            >
              <div class="cargo-card__head">
                <span class="cargo-card__title">{{ cargo.quantity }}x {{ cargo.loadCarrierType }}</span>
                <span class="cargo-card__weight">{{ cargo.weight }} kg</span>
              </div>
              <div class="cargo-card__meta">
                Dimensions: {{ cargo.dimensions.width }} × {{ cargo.dimensions.length }} ×
                {{ cargo.dimensions.height }} cm
              </div>
            </div>
          </div>
        </section>

        <!-- Billing -->
        <section v-if="order.billingInfo" class="kl-card kl-card--padded">
          <h3 class="section-h3">Billing info</h3>
          <p class="info-value">{{ order.billingInfo.customerName }}</p>
          <p class="kl-muted billing-line">
            {{ order.billingInfo.address }},
            {{ order.billingInfo.postalCode }} {{ order.billingInfo.city }}
          </p>
        </section>

        <!-- Edit form -->
        <section v-if="editing" class="kl-card kl-card--padded">
          <h3 class="section-h3">Edit order</h3>
          <form class="edit-form" @submit.prevent="saveEdit">
            <div class="kl-field">
              <label class="kl-label">Origin</label>
              <input v-model="editForm.origin" class="kl-input" />
            </div>
            <div class="kl-field">
              <label class="kl-label">Destination</label>
              <input v-model="editForm.destination" class="kl-input" />
            </div>
            <div class="kl-form-row">
              <div class="kl-field">
                <label class="kl-label">Delivery date</label>
                <input v-model="editForm.deliveryDate" class="kl-input" type="date" />
              </div>
              <div class="kl-field">
                <label class="kl-label">Status</label>
                <select v-model="editForm.state" class="kl-select">
                  <option value="PENDING">PENDING</option>
                  <option value="IN_PROCESS">IN_PROCESS</option>
                  <option value="DELIVERED">DELIVERED</option>
                </select>
              </div>
            </div>

            <div class="edit-form__actions">
              <button type="submit" class="kl-btn kl-btn--primary">Save changes</button>
              <button type="button" class="kl-btn kl-btn--ghost" @click="cancelEdit">Cancel</button>
            </div>
          </form>
        </section>
      </div>
    </template>

    <p v-else-if="!errorMessage" class="kl-muted loading">Loading order...</p>
  </div>
</template>

<style scoped>
.order-detail {
  padding-bottom: 3rem;
}

.detail-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.detail-main__head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.tiny-label {
  font-size: 0.7rem;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
}

.detail-main__state {
  margin-top: 0.35rem;
}

.detail-id {
  font-family: var(--font-mono);
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  padding: 0.3rem 0.65rem;
  background: var(--color-background-hover);
  border-radius: var(--radius-sm);
}

.route {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 1rem;
  align-items: center;
  padding: 1rem;
  border-radius: var(--radius);
  background: var(--color-background-subtle);
  border: 1px solid var(--color-border);
  margin-bottom: 1.25rem;
}

.route__point {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
  min-width: 0;
}

.route__point--end {
  justify-self: end;
  text-align: right;
  flex-direction: row-reverse;
}

.route__dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--color-primary);
  box-shadow: 0 0 0 4px var(--color-primary-soft);
  margin-top: 6px;
  flex-shrink: 0;
}

.route__dot--end {
  background: var(--color-info);
  box-shadow: 0 0 0 4px var(--color-info-soft);
}

.route__label {
  font-size: 0.72rem;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
}

.route__value {
  margin-top: 0.2rem;
  font-weight: 500;
  color: var(--color-heading);
  word-break: break-word;
}

.route__line {
  color: var(--color-text-muted);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
}

.info-value {
  margin-top: 0.25rem;
  font-weight: 500;
  color: var(--color-heading);
}

.billing-line {
  margin-top: 0.25rem;
  font-size: 0.875rem;
}

.section-h3 {
  margin: 0 0 0.85rem;
  font-size: 1rem;
}

.cargo-list {
  display: grid;
  gap: 0;
}

.cargo-card {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.cargo-card:last-child {
  border-bottom: none;
}

.cargo-card__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.cargo-card__title {
  font-weight: 600;
  color: var(--color-heading);
}

.cargo-card__weight {
  color: var(--color-text-secondary);
  font-size: 0.875rem;
}

.cargo-card__meta {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.edit-form__actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.loading {
  padding: 2rem 0;
  font-style: italic;
}

@media (max-width: 720px) {
  .route {
    grid-template-columns: 1fr;
  }
  .route__line { display: none; }
  .route__point--end {
    justify-self: start;
    text-align: left;
    flex-direction: row;
  }
  .info-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
