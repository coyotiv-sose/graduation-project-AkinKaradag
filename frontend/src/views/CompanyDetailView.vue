<script>
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
    customers() {
      return useCustomerStore().customers
    },
    employees() {
      return useEmployeeStore().employees
    },
  },
  async mounted() {
    await useCompanyStore().getAllCompanies()
    this.company = useCompanyStore().companies.find(c => c._id === this.companyId)
    await Promise.all([
      useCustomerStore().getAllCustomers(this.companyId),
      useEmployeeStore().getAllEmployees(this.companyId),
    ])
  },
}
</script>

<template lang="pug">
main(v-if='company')
  h1 {{ company.companyName }}
  p {{ company.address }}, {{ company.postalCode }} {{ company.city }}

  section
    h2 Customers
    ul
      li(v-for='customer in customers' :key='customer._id')
        | {{ customer.customerName }} - {{ customer.account.email }}
    router-link(:to='`/companies/${companyId}/customers`')
      button Add Customer

  section
    h2 Employees
    ul
      li(v-for='employee in employees' :key='employee._id')
        | {{ employee.name }} - {{ employee.profile }}
    router-link(:to='`/companies/${companyId}/employees`')
      button Add Employee

  section.actions
    h2 Operations
    router-link(:to='`/companies/${companyId}/dispatcher`')
      button.btn-primary Planning Panel
    router-link(:to='`/companies/${companyId}/vehicles`')
      button Manage Vehicles

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

ul {
  list-style: none;
  padding: 0;
}

li {
  padding: 0.5rem 0;
  border-bottom: 1px solid #eee;
}

button {
  margin-top: 0.75rem;
  padding: 0.5rem 1rem;
  cursor: pointer;
}

.btn-primary {
  background: #2c7a2c;
  color: white;
  border: none;
  border-radius: 6px;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  a {
    display: inline-block;
  }
}
</style>
