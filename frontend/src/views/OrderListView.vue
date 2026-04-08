<script>
import { useOrderStore } from '@/stores/orderStore'
import { useCustomerStore } from '@/stores/customerStore'
import { useCompanyStore } from '@/stores/companyStore'

export default {
  name: 'OrderListView',
  data() {
    return {
      selectedCompany: '',
      selectedCustomer: '',
    }
  },
  computed: {
    companies() {
      return useCompanyStore().companies
    },
    customers() {
      return useCustomerStore().customers
    },
    orders() {
      return useOrderStore().orders
    },
  },
  async mounted() {
    await useCompanyStore().getAllCompanies()
  },
  watch: {
    async selectedCompany(companyId) {
      if (companyId) {
        this.selectedCustomer = ''
        await useCustomerStore().getAllCustomers(companyId)
        await useOrderStore().getOrdersByCompany(companyId)
      }
    },
    async selectedCustomer(customerId) {
      if (customerId) {
        await useOrderStore().getOrders(customerId)
      } else if (this.selectedCompany) {
        await useOrderStore().getOrdersByCompany(this.selectedCompany)
      }
    },
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
  h1 Orders

  section.selectors
    label Company
    select(v-model='selectedCompany')
      option(disabled value='') Select a company
      option(v-for='company in companies' :key='company._id' :value='company._id')
        | {{ company.companyName }}

    label Customer (optional)
    select(v-model='selectedCustomer' :disabled='!selectedCompany')
      option(value='') All customers
      option(v-for='customer in customers' :key='customer._id' :value='customer._id')
        | {{ customer.customerName }}

  section.orders-list
    p.empty(v-if='!orders.length && selectedCompany') No orders found
    p.empty(v-if='!selectedCompany') Select a company to view orders

    .order-card(v-for='order in orders' :key='order._id')
      .order-header
        span.order-id \#{{ order._id.slice(-5) }}
        span.badge(:class='stateClass(order.state)') {{ order.state }}
      p.route {{ order.origin }} → {{ order.destination }}
      p.meta {{ formatDate(order.deliveryDate) }} · {{ order.cargos.length }} cargo(s)
      p.customer(v-if='order.customer && order.customer.customerName')
        | Customer: {{ order.customer.customerName }}
      router-link(:to='`/orders/${order._id}`')
        button.btn-sm View Details
</template>

<style scoped>
@import '@/assets/shared.css';

main {
  max-width: 700px;
  margin: 0 auto;
  padding: 2rem;
}

h1 {
  margin-bottom: 1.5rem;
}

.selectors {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.selectors select {
  padding: 0.5rem;
  font-size: 1rem;
}

.order-card {
  background: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 0.75rem;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
}

.order-id {
  font-weight: 600;
}

.route {
  font-weight: 500;
  margin: 0.25rem 0;
}

.customer {
  font-size: 0.85rem;
  color: #555;
}
</style>
