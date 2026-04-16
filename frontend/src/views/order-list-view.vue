<script>
import { mapState, mapActions } from 'pinia'
import { useOrderStore } from '@/stores/order-store'
import { useAccountStore } from '@/stores/account-store'
import PageHeader from '@/components/page-header.vue'
import { Plus, ChevronRight } from 'lucide-vue-next'

export default {
  name: 'OrderListView',
  components: { PageHeader, Plus, ChevronRight },
  computed: {
    ...mapState(useAccountStore, ['isCustomer', 'customerId', 'companyId']),
    ...mapState(useOrderStore, ['orders']),
  },
  methods: {
    ...mapActions(useOrderStore, ['getOrders', 'getOrdersByCompany']),
    formatDate(date) {
      return new Date(date).toLocaleDateString()
    },
    orderBadgeClass(state) {
      return {
        PENDING: 'kl-badge kl-badge--warning',
        IN_PROCESS: 'kl-badge kl-badge--info',
        DELIVERED: 'kl-badge kl-badge--primary',
      }[state] || 'kl-badge kl-badge--muted'
    },
  },
  async mounted() {
    if (this.isCustomer && this.customerId) {
      await this.getOrders(this.customerId)
    } else if (this.companyId) {
      await this.getOrdersByCompany(this.companyId)
    }
  },
}
</script>

<template>
  <div class="order-list">
    <PageHeader
      title="Orders"
      :subtitle="isCustomer ? 'Your transport orders.' : 'All company transport orders.'"
    >
      <template #actions>
        <router-link to="/orders/new" class="kl-btn kl-btn--primary">
          <Plus :size="14" :stroke-width="2" /> New order
        </router-link>
      </template>
    </PageHeader>

    <section class="kl-card kl-card--flush">
      <div v-if="!orders.length" class="empty">
        <p>No orders yet.</p>
        <router-link to="/orders/new" class="kl-btn kl-btn--outline">
          Create your first order
        </router-link>
      </div>

      <table v-else class="kl-table">
        <thead>
          <tr>
            <th>Order</th>
            <th>Route</th>
            <th v-if="!isCustomer">Customer</th>
            <th>Cargo</th>
            <th>Delivery</th>
            <th>Status</th>
            <th />
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="order in orders"
            :key="order._id"
            class="order-row"
            @click="$router.push(`/orders/${order._id}`)"
          >
            <td>
              <span class="order-id">#{{ order._id.slice(-5) }}</span>
            </td>
            <td>
              <span class="order-route">
                {{ order.origin }}
                <ChevronRight :size="14" :stroke-width="1.75" />
                {{ order.destination }}
              </span>
            </td>
            <td v-if="!isCustomer" class="kl-muted">
              {{ order.customer?.customerName || '—' }}
            </td>
            <td class="kl-muted">{{ order.cargos.length }} cargo(s)</td>
            <td class="kl-muted">{{ formatDate(order.deliveryDate) }}</td>
            <td>
              <span :class="orderBadgeClass(order.state)">{{ order.state }}</span>
            </td>
            <td class="row-chev">
              <ChevronRight :size="16" :stroke-width="1.75" />
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<style scoped>
.order-list {
  padding-bottom: 2rem;
}

.empty {
  padding: 3rem 1rem;
  text-align: center;
  color: var(--color-text-secondary);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.order-row {
  cursor: pointer;
}

.order-id {
  font-family: var(--font-mono);
  font-size: 0.85rem;
  color: var(--color-text);
  font-weight: 500;
}

.order-route {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  color: var(--color-text);
  font-weight: 500;
  flex-wrap: wrap;
}

.row-chev {
  color: var(--color-text-muted);
  text-align: right;
  width: 32px;
}

.order-row:hover .row-chev {
  color: var(--color-primary);
}
</style>
