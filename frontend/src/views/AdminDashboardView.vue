<script>
import { mapState, mapActions } from 'pinia'
import { useAdminStore } from '@/stores/adminStore'
import { useAccountStore } from '@/stores/accountStore'

export default {
  name: 'AdminDashboardView',
  data() {
    return {
      activeTab: 'companies',
      showCompanyForm: false,
      editingCompany: null,
      companyForm: { companyName: '', address: '', postalCode: '', city: '' },
      error: null,
    }
  },
  computed: {
    ...mapState(useAccountStore, ['isAdmin']),
    ...mapState(useAdminStore, ['companies', 'allCustomers', 'allOrders']),
  },
  methods: {
    ...mapActions(useAdminStore, ['getAllCompanies', 'createCompany', 'updateCompany', 'deleteCompany', 'getAllCustomers', 'getAllOrders']),
    openCreateCompany() {
      this.editingCompany = null
      this.companyForm = { companyName: '', address: '', postalCode: '', city: '' }
      this.showCompanyForm = true
      this.error = null
    },
    openEditCompany(company) {
      this.editingCompany = company._id
      this.companyForm = {
        companyName: company.companyName,
        address: company.address,
        postalCode: company.postalCode,
        city: company.city,
      }
      this.showCompanyForm = true
      this.error = null
    },
    async submitCompany() {
      try {
        this.error = null
        if (this.editingCompany) {
          await this.updateCompany(this.editingCompany, this.companyForm)
        } else {
          await this.createCompany(this.companyForm)
        }
        this.showCompanyForm = false
        this.companyForm = { companyName: '', address: '', postalCode: '', city: '' }
        this.editingCompany = null
      } catch (err) {
        this.error = err.response?.data?.error || err.message
      }
    },
    async removeCompany(companyId) {
      if (!confirm('Are you sure you want to delete this company?')) return
      try {
        await this.deleteCompany(companyId)
      } catch (err) {
        this.error = err.response?.data?.error || err.message
      }
    },
    cancelForm() {
      this.showCompanyForm = false
      this.editingCompany = null
      this.error = null
    },
    formatDate(date) {
      if (!date) return '—'
      return new Date(date).toLocaleDateString()
    },
    stateBadgeClass(state) {
      if (state === 'DELIVERED') return 'bg-success'
      if (state === 'IN_PROCESS') return 'bg-warning text-dark'
      return 'bg-secondary'
    },
  },
  async mounted() {
    if (!this.isAdmin) return
    await Promise.all([
      this.getAllCompanies(),
      this.getAllCustomers(),
      this.getAllOrders(),
    ])
  },
}
</script>

<template lang="pug">
main(v-if="isAdmin")
  h1 Admin Dashboard

  //- Tabs
  ul.nav.nav-tabs.mb-4
    li.nav-item
      a.nav-link(:class="{ active: activeTab === 'companies' }" href="#" @click.prevent="activeTab = 'companies'") Companies ({{ companies.length }})
    li.nav-item
      a.nav-link(:class="{ active: activeTab === 'customers' }" href="#" @click.prevent="activeTab = 'customers'") Customers ({{ allCustomers.length }})
    li.nav-item
      a.nav-link(:class="{ active: activeTab === 'orders' }" href="#" @click.prevent="activeTab = 'orders'") Orders ({{ allOrders.length }})

  //- Error display
  .alert.alert-danger(v-if="error") {{ error }}

  //- Companies Tab
  section(v-if="activeTab === 'companies'")
    .d-flex.justify-content-between.align-items-center.mb-3
      h2 Companies
      button.btn.btn-success(@click="openCreateCompany")
        | + Add Company

    //- Company Form
    .card.mb-3(v-if="showCompanyForm")
      .card-body
        h5.card-title {{ editingCompany ? 'Edit Company' : 'New Company' }}
        form(@submit.prevent="submitCompany")
          .mb-2
            label.form-label Company Name
            input.form-control(v-model="companyForm.companyName" required)
          .mb-2
            label.form-label Address
            input.form-control(v-model="companyForm.address" required)
          .row.mb-2
            .col
              label.form-label Postal Code
              input.form-control(v-model="companyForm.postalCode" required)
            .col
              label.form-label City
              input.form-control(v-model="companyForm.city" required)
          .d-flex.gap-2
            button.btn.btn-success(type="submit") {{ editingCompany ? 'Save' : 'Create' }}
            button.btn.btn-outline-secondary(type="button" @click="cancelForm") Cancel

    //- Company List
    .table-responsive
      table.table.table-hover
        thead
          tr
            th Name
            th Address
            th City
            th Actions
        tbody
          tr(v-for="company in companies" :key="company._id")
            td
              router-link(:to="`/companies/${company._id}`") {{ company.companyName }}
            td {{ company.address }}
            td {{ company.postalCode }} {{ company.city }}
            td
              .btn-group.btn-group-sm
                button.btn.btn-outline-primary(@click="openEditCompany(company)") Edit
                button.btn.btn-outline-danger(@click="removeCompany(company._id)") Delete

  //- Customers Tab
  section(v-if="activeTab === 'customers'")
    h2 All Customers
    .table-responsive
      table.table.table-hover
        thead
          tr
            th Name
            th Email
            th Company
        tbody
          tr(v-for="customer in allCustomers" :key="customer._id")
            td {{ customer.customerName }}
            td {{ customer.account?.email }}
            td
              router-link(v-if="customer.company" :to="`/companies/${customer.company._id || customer.company}`") {{ customer.company.companyName || customer.company }}
              span(v-else) —

  //- Orders Tab
  section(v-if="activeTab === 'orders'")
    h2 All Orders
    .table-responsive
      table.table.table-hover
        thead
          tr
            th Origin
            th Destination
            th Customer
            th Delivery Date
            th State
        tbody
          tr(v-for="order in allOrders" :key="order._id")
            td {{ order.origin }}
            td {{ order.destination }}
            td {{ order.customer?.customerName || order.customer }}
            td {{ formatDate(order.deliveryDate) }}
            td
              span.badge(:class="stateBadgeClass(order.state)") {{ order.state }}

main(v-else)
  .alert.alert-warning.mt-4 You do not have admin access.
</template>

<style scoped>
main {
  max-width: 1100px;
  margin: 0 auto;
  padding: 2rem;
}

.nav-tabs .nav-link {
  cursor: pointer;
}

.nav-tabs .nav-link.active {
  background-color: var(--color-primary);
  color: #fff;
  border-color: var(--color-primary);
}
</style>
