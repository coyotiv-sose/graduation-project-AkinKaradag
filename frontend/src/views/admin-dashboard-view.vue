<script>
import { mapState, mapActions } from 'pinia'
import { useAdminStore } from '@/stores/admin-store'
import { useAccountStore } from '@/stores/account-store'
import AdminDashboardCompanyTab from '@/components/admin-dashboard-company-tab.vue'
import AdminDashboardCustomerTab from '@/components/admin-dashboard-customer-tab.vue'
import AdminDashboardOrderTab from '@/components/admin-dashboard-order-tab.vue'
import AdminCompanyForm from '@/components/admin-company-form.vue'
import PageHeader from '@/components/page-header.vue'
import { Building2, Users, Package } from 'lucide-vue-next'

export default {
  name: 'AdminDashboardView',
  components: { AdminDashboardCompanyTab, AdminDashboardCustomerTab, AdminDashboardOrderTab, AdminCompanyForm, PageHeader, Building2, Users, Package },
  data() {
    return {
      activeTab: 'companies',
      formMode: null,
      editingCompany: null,
      isSubmittingCompany: false,
      isLoading: false,
      error: null,
      info: null,
    }
  },
  computed: {
    ...mapState(useAccountStore, ['isAdmin']),
    ...mapState(useAdminStore, ['companies', 'allCustomers', 'allOrders']),
    pendingOrdersCount() {
      return this.allOrders.filter(o => o.state === 'PENDING').length
    },
    inProcessOrdersCount() {
      return this.allOrders.filter(o => o.state === 'IN_PROCESS').length
    },
  },
  methods: {
    ...mapActions(useAdminStore, [
      'getAllCompanies', 'createCompany', 'updateCompany', 'deleteCompany',
      'getAllCustomers', 'getAllOrders',
    ]),
    resetFeedback() {
      this.error = null
      this.info = null
    },
    async loadDashboardData() {
      if (!this.isAdmin) return
      this.resetFeedback()
      this.isLoading = true
      try {
        await Promise.all([
          this.getAllCompanies(),
          this.getAllCustomers(),
          this.getAllOrders(),
        ])
      } catch (err) {
        this.error = err.response?.data?.error || err.message
      } finally {
        this.isLoading = false
      }
    },
    openCreateCompany() {
      this.resetFeedback()
      this.editingCompany = null
      this.formMode = 'create'
    },
    openEditCompany(company) {
      this.resetFeedback()
      this.editingCompany = company
      this.formMode = 'edit'
    },
    async handleSubmitCompany(payload) {
      this.resetFeedback()
      this.isSubmittingCompany = true
      try {
        if (this.formMode === 'edit') {
          await this.updateCompany(this.editingCompany._id, payload)
        } else {
          const result = await this.createCompany(payload)
          if (result?.owner) {
            this.info = `Company created with owner account: ${payload.ownerEmail}`
          }
        }
        this.formMode = null
        this.editingCompany = null
      } catch (err) {
        this.error = err.response?.data?.error || err.message
      } finally {
        this.isSubmittingCompany = false
      }
    },
    async removeCompany(companyId) {
      if (!confirm('Are you sure you want to delete this company?')) return
      this.resetFeedback()
      try {
        await this.deleteCompany(companyId)
      } catch (err) {
        this.error = err.response?.data?.error || err.message
      }
    },
    cancelForm() {
      this.resetFeedback()
      this.formMode = null
      this.editingCompany = null
    },
  },
  async mounted() {
    await this.loadDashboardData()
  },
}
</script>


<template lang="pug">
div.admin(v-if="isAdmin")
  PageHeader(
    title="Admin dashboard"
    subtitle="Manage companies, customers and transport orders across the RouteWerk network."
  )
  section.kpi-row
    .kpi
      .kpi__icon
        Building2(:size="18", :stroke-width="1.75")
      .kpi__body
        .kpi__label Companies
        .kpi__value {{ companies.length }}
    .kpi
      .kpi__icon
        Users(:size="18", :stroke-width="1.75")
      .kpi__body
        .kpi__label Customers
        .kpi__value {{ allCustomers.length }}
    .kpi
      .kpi__icon
        Package(:size="18", :stroke-width="1.75")
      .kpi__body
        .kpi__label Total orders
        .kpi__value {{ allOrders.length }}
    .kpi
      .kpi__icon.kpi__icon--warn
        Package(:size="18", :stroke-width="1.75")
      .kpi__body
        .kpi__label Active / pending
        .kpi__value {{ inProcessOrdersCount }} / {{ pendingOrdersCount }}
  p.kl-muted.loading-state(v-if="isLoading && !error") Loading dashboard data...
  div.kl-alert.kl-alert--danger(v-if="error") {{ error }}
  div.kl-alert.kl-alert--success(v-if="info") {{ info }}
  .kl-tabs(role="tablist")
    button.kl-tab(
      type="button"
      :class="{ 'kl-tab--active': activeTab === 'companies' }"
      @click="activeTab = 'companies'"
    )
      | Companies
      span.kl-tab-count {{ companies.length }}
    button.kl-tab(
      type="button"
      :class="{ 'kl-tab--active': activeTab === 'customers' }"
      @click="activeTab = 'customers'"
    )
      | Customers
      span.kl-tab-count {{ allCustomers.length }}
    button.kl-tab(
      type="button"
      :class="{ 'kl-tab--active': activeTab === 'orders' }"
      @click="activeTab = 'orders'"
    )
      | Orders
      span.kl-tab-count {{ allOrders.length }}
  template(v-if="activeTab === 'companies'")
    AdminCompanyForm(
      v-if="formMode"
      :initial-company="editingCompany"
      :is-submitting="isSubmittingCompany"
      @submit="handleSubmitCompany"
      @cancel="cancelForm"
    )
    AdminDashboardCompanyTab(
      :companies="companies"
      @open-create="openCreateCompany"
      @edit-company="openEditCompany"
      @delete-company="removeCompany"
    )
  AdminDashboardCustomerTab(
    v-if="activeTab === 'customers'"
    :customers="allCustomers"
  )
  AdminDashboardOrderTab(
    v-if="activeTab === 'orders'"
    :companies="companies"
    :orders="allOrders"
  )
div.admin-denied(v-else)
  .kl-alert.kl-alert--warning You do not have admin access.
</template>

<style scoped>
.admin {
  padding-bottom: 2rem;
}

.loading-state {
  margin: 0 0 1rem;
}

.kpi-row {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.85rem;
  margin-bottom: 1.5rem;
}

.kpi {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 1rem 1.15rem;
  background: var(--color-background-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
}

.kpi__icon {
  width: 38px;
  height: 38px;
  border-radius: var(--radius-sm);
  background: var(--color-primary-soft);
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.kpi__icon--warn {
  background: var(--color-warning-soft);
  color: var(--color-warning);
}

.kpi__label {
  font-size: 0.72rem;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
}

.kpi__value {
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--color-heading);
  letter-spacing: -0.01em;
  margin-top: 0.1rem;
}

.admin-denied {
  padding: 2rem 0;
}

@media (max-width: 960px) {
  .kpi-row {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
