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

<template>
  <div v-if="isAdmin" class="admin">
    <PageHeader
      title="Admin dashboard"
      subtitle="Manage companies, customers and transport orders across the KaraLog network."
    />

    <section class="kpi-row">
      <div class="kpi">
        <div class="kpi__icon"><Building2 :size="18" :stroke-width="1.75" /></div>
        <div class="kpi__body">
          <div class="kpi__label">Companies</div>
          <div class="kpi__value">{{ companies.length }}</div>
        </div>
      </div>
      <div class="kpi">
        <div class="kpi__icon"><Users :size="18" :stroke-width="1.75" /></div>
        <div class="kpi__body">
          <div class="kpi__label">Customers</div>
          <div class="kpi__value">{{ allCustomers.length }}</div>
        </div>
      </div>
      <div class="kpi">
        <div class="kpi__icon"><Package :size="18" :stroke-width="1.75" /></div>
        <div class="kpi__body">
          <div class="kpi__label">Total orders</div>
          <div class="kpi__value">{{ allOrders.length }}</div>
        </div>
      </div>
      <div class="kpi">
        <div class="kpi__icon kpi__icon--warn"><Package :size="18" :stroke-width="1.75" /></div>
        <div class="kpi__body">
          <div class="kpi__label">Active / pending</div>
          <div class="kpi__value">{{ inProcessOrdersCount }} / {{ pendingOrdersCount }}</div>
        </div>
      </div>
    </section>

    <div v-if="error" class="kl-alert kl-alert--danger">{{ error }}</div>
    <div v-if="info" class="kl-alert kl-alert--success">{{ info }}</div>

    <div class="kl-tabs" role="tablist">
      <button
        type="button"
        class="kl-tab"
        :class="{ 'kl-tab--active': activeTab === 'companies' }"
        @click="activeTab = 'companies'"
      >
        Companies <span class="kl-tab-count">{{ companies.length }}</span>
      </button>
      <button
        type="button"
        class="kl-tab"
        :class="{ 'kl-tab--active': activeTab === 'customers' }"
        @click="activeTab = 'customers'"
      >
        Customers <span class="kl-tab-count">{{ allCustomers.length }}</span>
      </button>
      <button
        type="button"
        class="kl-tab"
        :class="{ 'kl-tab--active': activeTab === 'orders' }"
        @click="activeTab = 'orders'"
      >
        Orders <span class="kl-tab-count">{{ allOrders.length }}</span>
      </button>
    </div>

    <section v-if="activeTab === 'companies'" class="kl-card kl-card--flush">
      <div class="kl-card-header">
        <div>
          <h2>Companies</h2>
          <p class="kl-muted section-sub">Operational tenants in the KaraLog network.</p>
        </div>
        <button type="button" class="kl-btn kl-btn--primary" @click="openCreateCompany">
          <Plus :size="16" :stroke-width="2" /> New company
        </button>
      </div>

      <div v-if="showCompanyForm" class="inline-form">
        <form @submit.prevent="submitCompany">
          <h3 class="inline-form__title">
            {{ editingCompany ? 'Edit company' : 'New company' }}
          </h3>

          <div class="kl-form-row" style="--cols: 1">
            <div class="kl-field">
              <label class="kl-label">Company name</label>
              <input v-model="companyForm.companyName" class="kl-input" required />
            </div>
            <div class="kl-field">
              <label class="kl-label">Address</label>
              <input v-model="companyForm.address" class="kl-input" required />
            </div>
          </div>

          <div class="kl-form-row">
            <div class="kl-field">
              <label class="kl-label">Postal code</label>
              <input v-model="companyForm.postalCode" class="kl-input" required />
            </div>
            <div class="kl-field">
              <label class="kl-label">City</label>
              <input v-model="companyForm.city" class="kl-input" required />
            </div>
          </div>

          <template v-if="!editingCompany">
            <div class="kl-divider" />
            <p class="kl-muted inline-form__hint">
              Optional: create an initial dispatcher account for this company.
            </p>
            <div class="kl-form-row" style="--cols: 1">
              <div class="kl-field">
                <label class="kl-label">Owner name</label>
                <input v-model="companyForm.ownerName" class="kl-input" />
              </div>
            </div>
            <div class="kl-form-row">
              <div class="kl-field">
                <label class="kl-label">Owner email</label>
                <input v-model="companyForm.ownerEmail" class="kl-input" type="email" />
              </div>
              <div class="kl-field">
                <label class="kl-label">Initial password</label>
                <input
                  v-model="companyForm.ownerPassword"
                  class="kl-input"
                  type="password"
                  minlength="6"
                />
              </div>
            </div>
          </template>

          <div class="inline-form__actions">
            <button type="submit" class="kl-btn kl-btn--primary">
              {{ editingCompany ? 'Save' : 'Create' }}
            </button>
            <button type="button" class="kl-btn kl-btn--ghost" @click="cancelForm">
              Cancel
            </button>
          </div>
        </form>
      </div>

      <div class="kl-table-wrap">
        <table class="kl-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Address</th>
              <th>City</th>
              <th class="kl-table__actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="company in companies" :key="company._id">
              <td>
                <router-link :to="`/companies/${company._id}`">
                  {{ company.companyName }}
                </router-link>
              </td>
              <td class="kl-muted">{{ company.address }}</td>
              <td class="kl-muted">{{ company.postalCode }} {{ company.city }}</td>
              <td class="kl-table__actions">
                <button
                  type="button"
                  class="kl-btn kl-btn--ghost kl-btn--sm"
                  title="Edit"
                  @click="openEditCompany(company)"
                >
                  <Pencil :size="14" :stroke-width="1.75" />
                </button>
                <button
                  type="button"
                  class="kl-btn kl-btn--ghost kl-btn--sm danger-icon"
                  title="Delete"
                  @click="removeCompany(company._id)"
                >
                  <Trash2 :size="14" :stroke-width="1.75" />
                </button>
              </td>
            </tr>
            <tr v-if="!companies.length">
              <td colspan="4" class="kl-muted empty-row">No companies yet.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section v-if="activeTab === 'customers'" class="kl-card kl-card--flush">
      <div class="kl-card-header">
        <div>
          <h2>Customers</h2>
          <p class="kl-muted section-sub">Read-only overview. Edits happen on the company page.</p>
        </div>
        <div class="search-input">
          <Search :size="14" :stroke-width="1.75" class="search-input__icon" />
          <input
            v-model="customerSearch"
            class="kl-input kl-input--sm search-input__control"
            placeholder="Search name, email or company"
          />
        </div>
      </div>

      <div class="kl-table-wrap">
        <table class="kl-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Company</th>
              <th class="kl-table__actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="customer in filteredCustomers" :key="customer._id">
              <td>{{ customer.customerName }}</td>
              <td class="kl-muted">{{ customer.account?.email }}</td>
              <td>
                <router-link
                  v-if="customer.company"
                  :to="{ name: 'companyDetail', params: { companyId: companyIdOf(customer) } }"
                >
                  {{ customer.company.companyName || customer.company }}
                </router-link>
                <span v-else class="kl-muted">&mdash;</span>
              </td>
              <td class="kl-table__actions">
                <router-link
                  v-if="companyIdOf(customer)"
                  class="kl-btn kl-btn--outline kl-btn--sm"
                  :to="{ name: 'companyDetail', params: { companyId: companyIdOf(customer) } }"
                >
                  Open
                </router-link>
                <span v-else class="kl-muted">No company</span>
              </td>
            </tr>
            <tr v-if="!filteredCustomers.length">
              <td colspan="4" class="kl-muted empty-row">No customers match this search.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section v-if="activeTab === 'orders'" class="kl-card kl-card--flush">
      <div class="kl-card-header">
        <div>
          <h2>Orders</h2>
          <p class="kl-muted section-sub">Read-only overview. Edits happen on the company page.</p>
        </div>
      </div>

      <div class="filter-row">
        <div class="search-input">
          <Search :size="14" :stroke-width="1.75" class="search-input__icon" />
          <input
            v-model="orderSearch"
            class="kl-input kl-input--sm search-input__control"
            placeholder="Search origin or destination"
          />
        </div>
        <select v-model="orderCompanyFilter" class="kl-select kl-input--sm">
          <option value="">All companies</option>
          <option v-for="c in companies" :key="c._id" :value="c._id">{{ c.companyName }}</option>
        </select>
        <select v-model="orderStateFilter" class="kl-select kl-input--sm">
          <option value="ALL">All states</option>
          <option value="PENDING">PENDING</option>
          <option value="IN_PROCESS">IN_PROCESS</option>
          <option value="DELIVERED">DELIVERED</option>
        </select>
      </div>

      <div class="kl-table-wrap">
        <table class="kl-table">
          <thead>
            <tr>
              <th>Origin</th>
              <th>Destination</th>
              <th>Customer</th>
              <th>Company</th>
              <th>Delivery</th>
              <th>Status</th>
              <th class="kl-table__actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in filteredOrders" :key="order._id">
              <td>{{ order.origin }}</td>
              <td>{{ order.destination }}</td>
              <td class="kl-muted">{{ order.customer?.customerName || order.customer }}</td>
              <td class="kl-muted">{{ order.company?.companyName || '—' }}</td>
              <td class="kl-muted">{{ formatDate(order.deliveryDate) }}</td>
              <td>
                <span :class="orderBadgeClass(order.state)">{{ order.state }}</span>
              </td>
              <td class="kl-table__actions">
                <router-link
                  v-if="companyIdOf(order)"
                  class="kl-btn kl-btn--outline kl-btn--sm"
                  :to="{ name: 'companyDetail', params: { companyId: companyIdOf(order) } }"
                >
                  Open
                </router-link>
                <span v-else class="kl-muted">No company</span>
              </td>
            </tr>
            <tr v-if="!filteredOrders.length">
              <td colspan="7" class="kl-muted empty-row">No orders match these filters.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>

  <div v-else class="admin-denied">
    <div class="kl-alert kl-alert--warning">You do not have admin access.</div>
  </div>
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
