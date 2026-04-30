<script>
import { Search as SearchIcon } from 'lucide-vue-next'

export default {
  name: 'AdminDashboardCustomerTab',
  components: { SearchIcon },
  props: {
    customers: { type: Array, default: () => [] },
  },
  data() {
    return {
      customerSearch: '',
    }
  },
  computed: {
    filteredCustomers() {
      const query = this.customerSearch.trim().toLowerCase()
      if (!query) return this.customers
      return this.customers.filter(customer => this.matchesCustomerSearch(customer, query))
    },
  },
  methods: {
    companyIdOf(entity) {
      return entity?.company?._id || entity?.company || null
    },
    matchesCustomerSearch(customer, query) {
      const name = (customer.customerName || '').toLowerCase()
      const email = (customer.account?.email || '').toLowerCase()
      const company = (customer.company?.companyName || '').toLowerCase()
      return name.includes(query) || email.includes(query) || company.includes(query)
    },
  },
}
</script>

<template lang="pug">
section.kl-card.kl-card--flush
  .kl-card-header
    div
      h2 Customers
      p.kl-muted.section-sub Read-only overview. Edits happen on the company page.
    .search-input
      SearchIcon(:size="14", :stroke-width="1.75", class="search-input__icon")
      input.kl-input.kl-input--sm.search-input__control(
        v-model="customerSearch"
        placeholder="Search name, email or company"
      )
  .kl-table-wrap
    table.kl-table
      thead
        tr
          th Name
          th Email
          th Company
          th.kl-table__actions Actions
      tbody
        tr(v-for="customer in filteredCustomers", :key="customer._id")
          td {{ customer.customerName }}
          td.kl-muted {{ customer.account?.email }}
          td
            router-link(
              v-if="customer.company"
              :to="{ name: 'companyDetail', params: { companyId: companyIdOf(customer) } }"
            ) {{ customer.company.companyName || customer.company }}
            span.kl-muted(v-else) —
          td.kl-table__actions
            router-link(
              v-if="companyIdOf(customer)"
              class="kl-btn kl-btn--outline kl-btn--sm"
              :to="{ name: 'companyDetail', params: { companyId: companyIdOf(customer) } }"
            ) Open
            span.kl-muted(v-else) No company
        tr(v-if="!filteredCustomers.length")
          td.kl-muted.empty-row(colspan="4") No customers match this search.
</template>