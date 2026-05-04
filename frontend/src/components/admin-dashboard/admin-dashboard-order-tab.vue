<script>
import { Search as SearchIcon } from 'lucide-vue-next'
import { formatDate, orderBadgeClass } from '@/utils/display-helpers'

export default {
  name: 'AdminDashboardOrderTab',
  components: { SearchIcon },
  props: {
    companies: { type: Array, default: () => [] },
    orders: { type: Array, default: () => [] },
  },
  data() {
    return {
      orderSearch: '',
      orderCompanyFilter: '',
      orderStateFilter: 'ALL',
    }
  },
  computed: {
    filteredOrders() {
      const query = this.orderSearch.trim().toLowerCase()
      return this.orders.filter(order => this.matchesOrderFilters(order, query))
    },
  },
  methods: {
    companyIdOf(entity) {
      return entity?.company?._id || entity?.company || null
    },
    formatDate,
    matchesOrderFilters(order, query) {
      if (query) {
        const origin = (order.origin || '').toLowerCase()
        const destination = (order.destination || '').toLowerCase()
        if (!origin.includes(query) && !destination.includes(query)) return false
      }

      if (this.orderCompanyFilter) {
        const orderCompanyId = order.company?._id || order.company
        if (String(orderCompanyId) !== String(this.orderCompanyFilter)) return false
      }

      if (this.orderStateFilter !== 'ALL' && order.state !== this.orderStateFilter) {
        return false
      }

      return true
    },
    orderBadgeClass,
  },
}
</script>

<template lang="pug">
section.kl-card.kl-card--flush
  .kl-card-header
    div
      h2 Orders
      p.kl-muted.section-sub Read-only overview. Edits happen on the company page.
  .filter-row
    .search-input
      SearchIcon(:size="14", :stroke-width="1.75", class="search-input__icon")
      input.kl-input.kl-input--sm.search-input__control(
        v-model="orderSearch"
        placeholder="Search origin or destination"
      )
    select.kl-select.kl-input--sm(v-model="orderCompanyFilter")
      option(value="") All companies
      option(v-for="company in companies", :key="company._id", :value="company._id")
        | {{ company.companyName }}
    select.kl-select.kl-input--sm(v-model="orderStateFilter")
      option(value="ALL") All states
      option(value="PENDING") PENDING
      option(value="IN_PROCESS") IN_PROCESS
      option(value="DELIVERED") DELIVERED
  .kl-table-wrap
    table.kl-table
      thead
        tr
          th Origin
          th Destination
          th Customer
          th Company
          th Delivery
          th Status
          th.kl-table__actions Actions
      tbody
        tr(v-for="order in filteredOrders", :key="order._id")
          td {{ order.origin }}
          td {{ order.destination }}
          td.kl-muted {{ order.customer?.customerName || order.customer }}
          td.kl-muted {{ order.company?.companyName || '—' }}
          td.kl-muted {{ formatDate(order.deliveryDate) }}
          td
            span(:class="orderBadgeClass(order.state)") {{ order.state }}
          td.kl-table__actions
            router-link(
              v-if="companyIdOf(order)"
              class="kl-btn kl-btn--outline kl-btn--sm"
              :to="{ name: 'companyDetail', params: { companyId: companyIdOf(order) } }"
            ) Open
            span.kl-muted(v-else) No company
        tr(v-if="!filteredOrders.length")
          td.kl-muted.empty-row(colspan="7") No orders match these filters.
</template>
