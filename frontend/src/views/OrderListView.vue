<script>
import { useOrderStore } from '@/stores/orderStore'
import { useAccountStore } from '@/stores/accountStore'

export default {
  name: 'OrderListView',
  computed: {
    accountStore() {
      return useAccountStore()
    },
    isCustomer() {
      return this.accountStore.isCustomer
    },
    customerId() {
      return this.accountStore.customerId
    },
    companyId() {
      return this.accountStore.companyId
    },
    orders() {
      return useOrderStore().orders
    },
  },
  async mounted() {
    if (this.isCustomer && this.customerId) {
      await useOrderStore().getOrders(this.customerId)
    } else if (this.companyId) {
      await useOrderStore().getOrdersByCompany(this.companyId)
    }
  },
  methods: {
    formatDate(date) {
      return new Date(date).toLocaleDateString()
    },
    stateClass(state) {
      return {
        'PENDING': 'badge-pending',
        'IN_PROCESS': 'badge-process',
        'DELIVERED': 'badge-delivered',
      }[state] || ''
    },
  },
}
</script>

<template lang="pug">
main
  .card
    .card-header
      h1.mb-0 Orders
    .list-group.list-group-flush
      router-link.list-group-item.list-group-item-action(
        v-for="order in orders"
        :key="order._id"
        :to="`/orders/${order._id}`"
        :class="{ active: order.state === 'IN_PROCESS' }"
      )
        .d-flex.justify-content-between.align-items-center
          span.fw-semibold \#{{ order._id.slice(-5) }}
          span.badge(:class="stateClass(order.state)") {{ order.state }}
        .d-flex.justify-content-between.align-items-center.mt-1
          span {{ order.origin }} → {{ order.destination }}
          small {{ formatDate(order.deliveryDate) }} · {{ order.cargos.length }} cargo(s)
        small.mt-1(v-if="!isCustomer && order.customer && order.customer.customerName")
          | Customer: {{ order.customer.customerName }}
    .card-body(v-if="!orders.length")
      p.text-secondary.mb-0 No orders found
</template>

<style scoped>
@import '@/assets/shared.css';

main {
  max-width: 700px;
  margin: 0 auto;
  padding: 2rem;
}

.list-group-item.active {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
}
</style>
