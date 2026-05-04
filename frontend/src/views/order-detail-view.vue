<script>
import { mapActions } from 'pinia'
import { useOrderStore } from '@/stores/order-store'
import { useSocketStore } from '@/stores/socket-store'
import PageHeader from '@/components/page-header.vue'
import { ChevronRight, Pencil } from 'lucide-vue-next'
import {
  formatDate,
  orderBadgeClass as getOrderBadgeClass,
} from '@/utils/display-helpers'
import { apiErrorMessage } from '@/utils/error-helpers'

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
      return getOrderBadgeClass(this.order?.state)
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
        this.errorMessage = apiErrorMessage(e, 'Order not found')
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
      return formatDate(date, {
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
        this.errorMessage = apiErrorMessage(e)
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


<template lang="pug">
.order-detail
  PageHeader(
    :title="order ? `Order #${order._id.slice(-5)}` : 'Order'"
    subtitle="Live transport order details."
    back-to="/orders"
    back-label="Back to orders"
  )
    template(v-if="order && !editing && order.state === 'PENDING'" #actions)
      button.kl-btn.kl-btn--outline(type="button" @click="startEdit")
        Pencil(:size="14", :stroke-width="1.75")
        |  Edit order
  div.kl-alert.kl-alert--danger(v-if="errorMessage") {{ errorMessage }}
  template(v-if="order")
    .detail-grid
      //- Route & status card
      section.kl-card.kl-card--padded.detail-main
        .detail-main__head
          div
            .kl-muted.tiny-label Transport status
            .detail-main__state
              span(:class="orderBadgeClass") {{ order.state }}
          .detail-id {{ '#' + order._id.slice(-5) }}
        .route
          .route__point
            .route__dot
            div
              .route__label Origin
              .route__value {{ order.origin }}
          .route__line(aria-hidden="true")
            ChevronRight(:size="18", :stroke-width="1.75")
          .route__point.route__point--end
            .route__dot.route__dot--end
            div
              .route__label Destination
              .route__value {{ order.destination }}
        .info-grid
          div
            .tiny-label Delivery date
            .info-value {{ formatDate(order.deliveryDate) }}
          div
            .tiny-label Cargo items
            .info-value {{ order.cargos.length }}
          div
            .tiny-label Total weight
            .info-value {{ totalWeight }} kg
          div(v-if="order.customer")
            .tiny-label Customer
            .info-value {{ order.customer.customerName || order.customer }}
      //- Cargo
      section.kl-card.kl-card--flush
        .kl-card-header
          h3 Cargo ({{ order.cargos.length }})
        .cargo-list
          div.cargo-card(v-for="(cargo, idx) in order.cargos" :key="idx")
            .cargo-card__head
              span.cargo-card__title {{ cargo.quantity }}x {{ cargo.loadCarrierType }}
              span.cargo-card__weight {{ cargo.weight }} kg
            .cargo-card__meta
              | Dimensions: {{ cargo.dimensions.width }} × {{ cargo.dimensions.length }} × {{ cargo.dimensions.height }} cm
      //- Billing
      section.kl-card.kl-card--padded(v-if="order.billingInfo")
        h3.section-h3 Billing info
        p.info-value {{ order.billingInfo.customerName }}
        p.kl-muted.billing-line
          | {{ order.billingInfo.address }},
          |  {{ order.billingInfo.postalCode }} {{ order.billingInfo.city }}
      //- Edit form
      section.kl-card.kl-card--padded(v-if="editing")
        h3.section-h3 Edit order
        form.edit-form(@submit.prevent="saveEdit")
          .kl-field
            label.kl-label Origin
            input.kl-input(v-model="editForm.origin")
          .kl-field
            label.kl-label Destination
            input.kl-input(v-model="editForm.destination")
          .kl-form-row
            .kl-field
              label.kl-label Delivery date
              input.kl-input(type="date" v-model="editForm.deliveryDate")
            .kl-field
              label.kl-label Status
              select.kl-select(v-model="editForm.state")
                option(value="PENDING") PENDING
                option(value="IN_PROCESS") IN_PROCESS
                option(value="DELIVERED") DELIVERED
          .edit-form__actions
            button.kl-btn.kl-btn--primary(type="submit") Save changes
            button.kl-btn.kl-btn--ghost(type="button" @click="cancelEdit") Cancel
  p.kl-muted.loading(v-else-if="!errorMessage") Loading order...
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
