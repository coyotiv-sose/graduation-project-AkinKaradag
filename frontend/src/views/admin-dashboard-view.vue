<script>
import { mapState, mapActions } from 'pinia'
import { useAdminStore } from '@/stores/admin-store'
import { useAccountStore } from '@/stores/account-store'
import PageHeader from '@/components/page-header.vue'
import { Plus, Building2, Users, Package, Search, Pencil, Trash2 } from 'lucide-vue-next'

const emptyCompanyForm = () => ({
  companyName: '',
  address: '',
  postalCode: '',
  city: '',
  ownerName: '',
  ownerEmail: '',
  ownerPassword: '',
})

export default {
  name: 'AdminDashboardView',
  components: { PageHeader, Plus, Building2, Users, Package, Search, Pencil, Trash2 },
  data() {
    return {
      activeTab: 'companies',
      showCompanyForm: false,
      editingCompany: null,
      companyForm: emptyCompanyForm(),
      customerSearch: '',
      orderSearch: '',
      orderCompanyFilter: '',
      orderStateFilter: 'ALL',
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
    filteredCustomers() {
      const q = this.customerSearch.trim().toLowerCase()
      if (!q) return this.allCustomers
      return this.allCustomers.filter(customer => {
        const name = (customer.customerName || '').toLowerCase()
        const email = (customer.account?.email || '').toLowerCase()
        const company = (customer.company?.companyName || '').toLowerCase()
        return name.includes(q) || email.includes(q) || company.includes(q)
      })
    },
    filteredOrders() {
      const q = this.orderSearch.trim().toLowerCase()
      return this.allOrders.filter(order => {
        if (q) {
          const origin = (order.origin || '').toLowerCase()
          const destination = (order.destination || '').toLowerCase()
          if (!origin.includes(q) && !destination.includes(q)) return false
        }
        if (this.orderCompanyFilter) {
          const orderCompanyId = order.company?._id || order.company
          if (String(orderCompanyId) !== String(this.orderCompanyFilter)) return false
        }
        if (this.orderStateFilter !== 'ALL' && order.state !== this.orderStateFilter) {
          return false
        }
        return true
      })
    },
  },
  methods: {
    ...mapActions(useAdminStore, [
      'getAllCompanies', 'createCompany', 'updateCompany', 'deleteCompany',
      'getAllCustomers', 'getAllOrders',
    ]),
    openCreateCompany() {
      this.editingCompany = null
      this.companyForm = emptyCompanyForm()
      this.showCompanyForm = true
      this.error = null
      this.info = null
    },
    openEditCompany(company) {
      this.editingCompany = company._id
      this.companyForm = {
        ...emptyCompanyForm(),
        companyName: company.companyName,
        address: company.address,
        postalCode: company.postalCode,
        city: company.city,
      }
      this.showCompanyForm = true
      this.error = null
      this.info = null
    },
    async submitCompany() {
      try {
        this.error = null
        this.info = null
        if (this.editingCompany) {
          const { ownerName, ownerEmail, ownerPassword, ...companyData } = this.companyForm
          await this.updateCompany(this.editingCompany, companyData)
        } else {
          const result = await this.createCompany(this.companyForm)
          if (result?.owner) {
            this.info = `Company created with owner account: ${this.companyForm.ownerEmail}`
          }
        }
        this.showCompanyForm = false
        this.companyForm = emptyCompanyForm()
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
      this.info = null
    },
    companyIdOf(entity) {
      return entity?.company?._id || entity?.company || null
    },
    formatDate(date) {
      if (!date) return '—'
      return new Date(date).toLocaleDateString()
    },
    orderBadgeClass(state) {
      if (state === 'DELIVERED') return 'kl-badge kl-badge--primary'
      if (state === 'IN_PROCESS') return 'kl-badge kl-badge--info'
      return 'kl-badge kl-badge--warning'
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
  section.kl-card.kl-card--flush(v-if="activeTab === 'companies'")
    .kl-card-header
      div
        h2 Companies
        p.kl-muted.section-sub Operational tenants in the RouteWerk network.
      button.kl-btn.kl-btn--primary(type="button", @click="openCreateCompany")
        Plus(:size="16", :stroke-width="2")
        | New company
    .inline-form(v-if="showCompanyForm")
      form(@submit.prevent="submitCompany")
        h3.inline-form__title {{ editingCompany ? 'Edit company' : 'New company' }}
        .kl-form-row(style="--cols: 1")
          .kl-field
            label.kl-label Company name
            input.kl-input(v-model="companyForm.companyName", required)
          .kl-field
            label.kl-label Address
            input.kl-input(v-model="companyForm.address", required)
        .kl-form-row
          .kl-field
            label.kl-label Postal code
            input.kl-input(v-model="companyForm.postalCode", required)
          .kl-field
            label.kl-label City
            input.kl-input(v-model="companyForm.city", required)
        template(v-if="!editingCompany")
          .kl-divider
          p.kl-muted.inline-form__hint Optional: create an initial dispatcher account for this company.
          .kl-form-row(style="--cols: 1")
            .kl-field
              label.kl-label Owner name
              input.kl-input(v-model="companyForm.ownerName")
          .kl-form-row
            .kl-field
              label.kl-label Owner email
              input.kl-input(v-model="companyForm.ownerEmail", type="email")
            .kl-field
              label.kl-label Initial password
              input.kl-input(v-model="companyForm.ownerPassword", type="password", minlength="6")
        .inline-form__actions
          button.kl-btn.kl-btn--primary(type="submit") {{ editingCompany ? 'Save' : 'Create' }}
          button.kl-btn.kl-btn--ghost(type="button", @click="cancelForm") Cancel
    .kl-table-wrap
      table.kl-table
        thead
          tr
            th Name
            th Address
            th City
            th.kl-table__actions Actions
        tbody
          tr(v-for="company in companies", :key="company._id")
            td
              router-link(:to="`/companies/${company._id}`") {{ company.companyName }}
            td.kl-muted {{ company.address }}
            td.kl-muted {{ company.postalCode }} {{ company.city }}
            td.kl-table__actions
              button.kl-btn.kl-btn--ghost.kl-btn--sm(type="button", title="Edit", @click="openEditCompany(company)")
                Pencil(:size="14", :stroke-width="1.75")
              button.kl-btn.kl-btn--ghost.kl-btn--sm.danger-icon(type="button", title="Delete", @click="removeCompany(company._id)")
                Trash2(:size="14", :stroke-width="1.75")
          tr(v-if="!companies.length")
            td.kl-muted.empty-row(colspan="4") No companies yet.
  section.kl-card.kl-card--flush(v-if="activeTab === 'customers'")
    .kl-card-header
      div
        h2 Customers
        p.kl-muted.section-sub Read-only overview. Edits happen on the company page.
      .search-input
        Search(:size="14", :stroke-width="1.75", class="search-input__icon")
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
  section.kl-card.kl-card--flush(v-if="activeTab === 'orders'")
    .kl-card-header
      div
        h2 Orders
        p.kl-muted.section-sub Read-only overview. Edits happen on the company page.
    .filter-row
      .search-input
        Search(:size="14", :stroke-width="1.75", class="search-input__icon")
        input.kl-input.kl-input--sm.search-input__control(
          v-model="orderSearch"
          placeholder="Search origin or destination"
        )
      select.kl-select.kl-input--sm(v-model="orderCompanyFilter")
        option(value="") All companies
        option(v-for="c in companies", :key="c._id", :value="c._id") {{ c.companyName }}
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
div.admin-denied(v-else)
  .kl-alert.kl-alert--warning You do not have admin access.
</template>

<style scoped>
.admin {
  padding-bottom: 2rem;
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

.section-sub {
  margin: 0.25rem 0 0;
  font-size: 0.85rem;
}

.kl-table-wrap {
  overflow-x: auto;
}

.kl-table__actions {
  text-align: right;
  white-space: nowrap;
  display: flex;
  justify-content: flex-end;
  gap: 0.25rem;
}

td.kl-table__actions {
  gap: 0.35rem;
}

.danger-icon:hover {
  color: var(--color-danger);
  background: var(--color-danger-soft);
}

.empty-row {
  text-align: center;
  padding: 2rem 1rem !important;
}

.inline-form {
  padding: 1.25rem;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-background-subtle);
}

.inline-form__title {
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1rem;
}

.inline-form__hint {
  font-size: 0.85rem;
  margin: 0 0 0.75rem;
}

.inline-form .kl-form-row + .kl-form-row {
  margin-top: 0.85rem;
}

.inline-form__actions {
  margin-top: 1.15rem;
  display: flex;
  gap: 0.5rem;
}

.search-input {
  position: relative;
  width: 280px;
  max-width: 100%;
}

.search-input__icon {
  position: absolute;
  left: 0.65rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-muted);
  pointer-events: none;
}

.search-input__control {
  padding-left: 1.9rem;
}

.filter-row {
  display: flex;
  gap: 0.5rem;
  padding: 0.85rem 1.25rem;
  border-bottom: 1px solid var(--color-border);
  flex-wrap: wrap;
}

.filter-row .kl-select {
  max-width: 220px;
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
