<script>
import { mapState, mapActions } from 'pinia'
import { useCompanyStore } from '@/stores/company-store'
import { useCustomerStore } from '@/stores/customer-store'
import { useEmployeeStore } from '@/stores/employee-store'
import { useAccountStore } from '@/stores/account-store'
import { useAdminStore } from '@/stores/admin-store'

export default {
  name: 'CompanyDetailView',
  data() {
    return {
      company: null,
      resetPasswordId: null,
      newPassword: '',
      error: null,
      success: null,
    }
  },
  computed: {
    companyId() {
      return this.$route.params.companyId
    },
    ...mapState(useCompanyStore, ['companies']),
    ...mapState(useCustomerStore, ['customers']),
    ...mapState(useEmployeeStore, ['employees']),
    ...mapState(useAccountStore, ['isAdmin']),
  },
  methods: {
    ...mapActions(useCompanyStore, ['getAllCompanies']),
    ...mapActions(useCustomerStore, ['getAllCustomers']),
    ...mapActions(useEmployeeStore, ['getAllEmployees']),
    ...mapActions(useAdminStore, { adminResetPassword: 'resetEmployeePassword' }),
    openResetPassword(employeeId) {
      this.resetPasswordId = employeeId
      this.newPassword = ''
      this.error = null
      this.success = null
    },
    async submitResetPassword() {
      try {
        this.error = null
        this.success = null
        await this.adminResetPassword(this.resetPasswordId, this.newPassword)
        this.success = 'Password reset successfully'
        this.resetPasswordId = null
        this.newPassword = ''
      } catch (err) {
        this.error = err.response?.data?.error || err.message
      }
    },
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

  .alert.alert-danger(v-if="error") {{ error }}
  .alert.alert-success(v-if="success") {{ success }}

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
        .list-group-item(v-for='employee in employees' :key='employee._id')
          .d-flex.justify-content-between.align-items-center
            div
              span.fw-semibold {{ employee.name }}
              span.text-secondary.ms-2 {{ employee.profile }}
            button.btn.btn-outline-warning.btn-sm(v-if="isAdmin" @click="openResetPassword(employee._id)") Reset Password
          //- Inline reset password form
          .mt-2(v-if="isAdmin && resetPasswordId === employee._id")
            form.d-flex.gap-2.align-items-end(@submit.prevent="submitResetPassword")
              .flex-grow-1
                label.form-label.small New Password
                input.form-control.form-control-sm(v-model="newPassword" type="password" required minlength="6")
              button.btn.btn-success.btn-sm(type="submit") Save
              button.btn.btn-outline-secondary.btn-sm(type="button" @click="resetPasswordId = null") Cancel

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
