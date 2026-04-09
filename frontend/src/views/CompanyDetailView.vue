<script>
import { mapState, mapActions } from 'pinia'
import { useCompanyStore } from '@/stores/companyStore'
import { useCustomerStore } from '@/stores/customerStore'
import { useEmployeeStore } from '@/stores/employeeStore'

export default {
  name: 'CompanyDetailView',
  data() {
    return {
      company: null,
    }
  },
  computed: {
    companyId() {
      return this.$route.params.companyId
    },
    ...mapState(useCompanyStore, ['companies']),
    ...mapState(useCustomerStore, ['customers']),
    ...mapState(useEmployeeStore, ['employees']),
  },
  methods: {
    ...mapActions(useCompanyStore, ['getAllCompanies']),
    ...mapActions(useCustomerStore, ['getAllCustomers']),
    ...mapActions(useEmployeeStore, ['getAllEmployees']),
  },
  async mounted() {
    await this.getAllCompanies()
    this.company = this.companies.find(c => c._id === this.companyId)
    await Promise.all([
      this.getAllCustomers(this.companyId),
      this.getAllEmployees(this.companyId),
    ])
  },
}
</script>

<template lang="pug">
main(v-if='company')
  h1 {{ company.companyName }}
  p.text-secondary {{ company.address }}, {{ company.postalCode }} {{ company.city }}

  section
    .card.mb-3
      .card-header.d-flex.justify-content-between.align-items-center
        h2.mb-0 Customers
        router-link.btn.btn-success.btn-sm(:to='`/companies/${companyId}/customers`') Add Customer
      .list-group.list-group-flush
        .list-group-item.list-group-item-action(v-for='customer in customers' :key='customer._id')
          .d-flex.justify-content-between.align-items-center
            span.fw-semibold {{ customer.customerName }}
            span.text-secondary {{ customer.account.email }}

  section
    .card.mb-3
      .card-header.d-flex.justify-content-between.align-items-center
        h2.mb-0 Employees
        router-link.btn.btn-success.btn-sm(:to='`/companies/${companyId}/employees`') Add Employee
      .list-group.list-group-flush
        .list-group-item.list-group-item-action(v-for='employee in employees' :key='employee._id')
          .d-flex.justify-content-between.align-items-center
            span.fw-semibold {{ employee.name }}
            span.text-secondary {{ employee.profile }}

  section.actions
    h2 Operations
    router-link.btn.btn-success(:to='`/companies/${companyId}/dispatcher`') Planning Panel
    router-link.btn.btn-outline-success(:to='`/companies/${companyId}/vehicles`') Manage Vehicles

main(v-else)
  p Loading company...
</template>

<style scoped>
main {
  max-width: 700px;
  margin: 0 auto;
  padding: 2rem;
}

section {
  margin-top: 2rem;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
</style>
