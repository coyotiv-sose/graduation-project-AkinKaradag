<script>
import { mapState, mapActions } from 'pinia'
import { useOrderStore } from '@/stores/order-store'
import { useAccountStore } from '@/stores/account-store'
import PageHeader from '@/components/page-header.vue'
import { Plus, ChevronRight } from 'lucide-vue-next'
import { formatDate, orderBadgeClass } from '@/utils/display-helpers'

export default {
  name: 'OrderListView',
  components: { PageHeader, Plus, ChevronRight },
  computed: {
    ...mapState(useAccountStore, ['isCustomer', 'customerId', 'companyId']),
    ...mapState(useOrderStore, ['orders']),
  },
  methods: {
    ...mapActions(useOrderStore, ['getOrders', 'getOrdersByCompany']),
    formatDate,
    orderBadgeClass,
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


<template lang="pug">
.order-list
  PageHeader(
    title="Orders"
    :subtitle="isCustomer ? 'Your transport orders.' : 'All company transport orders.'"
  )
    template(#actions)
      router-link.kl-btn.kl-btn--primary(to="/orders/new")
        Plus(:size="14", :stroke-width="2")
        |  New order
  section.kl-card.kl-card--flush
    div.empty(v-if="!orders.length")
      p No orders yet.
      router-link.kl-btn.kl-btn--outline(to="/orders/new") Create your first order
    table.kl-table(v-else)
      thead
        tr
          th Order
          th Route
          th(v-if="!isCustomer") Customer
          th Cargo
          th Delivery
          th Status
          th
      tbody
        tr.order-row(
          v-for="order in orders"
          :key="order._id"
          @click="$router.push(`/orders/${order._id}`)"
        )
          td
            span.order-id {{ '#' + order._id.slice(-5) }}
          td
            span.order-route
              | {{ order.origin }}
              ChevronRight(:size="14", :stroke-width="1.75")
              | {{ order.destination }}
          td.kl-muted(v-if="!isCustomer")
            | {{ order.customer?.customerName || '—' }}
          td.kl-muted {{ order.cargos.length }} cargo(s)
          td.kl-muted {{ formatDate(order.deliveryDate) }}
          td
            span(:class="orderBadgeClass(order.state)") {{ order.state }}
          td.row-chev
            ChevronRight(:size="16", :stroke-width="1.75")
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
