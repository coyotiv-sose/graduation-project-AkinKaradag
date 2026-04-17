<script>
import { mapState, mapActions } from 'pinia'
import { useCompanyStore } from '@/stores/company-store'
import { useCustomerStore } from '@/stores/customer-store'
import { useEmployeeStore } from '@/stores/employee-store'
import { useAccountStore } from '@/stores/account-store'
import { useAdminStore } from '@/stores/admin-store'
import PageHeader from '@/components/page-header.vue'
import { ChevronRight, Pencil, Trash2, Key, Plus, Building2, Route, Truck } from 'lucide-vue-next'

const emptyBillingItem = () => ({
  label: 'default',
  customerName: '',
  address: '',
  postalCode: '',
  city: '',
  VATnr: '',
  isDefault: false,
})

const emptyCustomerForm = () => ({
  customerName: '',
  email: '',
  company: '',
  profile: 'CUSTOMER_DEFAULT',
  billingInfo: [],
})

const emptyEmployeeForm = () => ({
  name: '',
  email: '',
  profile: 'DISPATCHER',
})

const emptyOrderForm = () => ({
  origin: '',
  destination: '',
  state: 'PENDING',
  deliveryDate: '',
})

export default {
  name: 'CompanyDetailView',
  components: {
    PageHeader, ChevronRight, Pencil, Trash2, Key, Plus, Building2, Route, Truck,
  },
  data() {
    return {
      company: null,
      resetTarget: null,
      newPassword: '',
      editingCustomerId: null,
      customerForm: emptyCustomerForm(),
      editingEmployeeId: null,
      employeeForm: emptyEmployeeForm(),
      editingOrderId: null,
      orderForm: emptyOrderForm(),
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
    ...mapState(useAccountStore, ['isAdmin', 'isEmployee']),
    ...mapState(useAdminStore, ['allOrders']),
    canManage() {
      return this.isAdmin || this.isEmployee
    },
    companyOrders() {
      if (!this.isAdmin) return []
      return this.allOrders.filter(o => {
        const oid = o.company?._id || o.company
        return String(oid) === String(this.companyId)
      })
    },
    backTarget() {
      const accountStore = useAccountStore()
      if (accountStore.isAdmin) {
        return { to: { name: 'admin' }, label: 'Back to admin dashboard' }
      }
      if (accountStore.isEmployee && accountStore.companyId) {
        return {
          to: { name: 'dispatcher', params: { companyId: accountStore.companyId } },
          label: 'Back to dispatcher',
        }
      }
      return { to: { name: 'home' }, label: 'Back' }
    },
  },
  methods: {
    ...mapActions(useCompanyStore, ['getAllCompanies', 'getCompany']),
    ...mapActions(useCustomerStore, {
      getAllCustomers: 'getAllCustomers',
      companyUpdateCustomer: 'updateCustomer',
      companyDeleteCustomer: 'deleteCustomer',
      companyResetCustomerPassword: 'resetCustomerPassword',
    }),
    ...mapActions(useEmployeeStore, {
      getAllEmployees: 'getAllEmployees',
      companyUpdateEmployee: 'updateEmployee',
      companyDeleteEmployee: 'deleteEmployee',
      companyResetEmployeePassword: 'resetEmployeePassword',
    }),
    ...mapActions(useAdminStore, {
      adminUpdateOrder: 'updateOrder',
      adminDeleteOrder: 'deleteOrder',
      adminGetAllOrders: 'getAllOrders',
    }),
    clearMessages() {
      this.error = null
      this.success = null
    },
    closeAllForms() {
      this.resetTarget = null
      this.newPassword = ''
      this.editingCustomerId = null
      this.editingEmployeeId = null
      this.editingOrderId = null
    },
    openResetPassword(type, id) {
      this.closeAllForms()
      this.clearMessages()
      this.resetTarget = { type, id }
    },
    cancelResetPassword() {
      this.resetTarget = null
      this.newPassword = ''
    },
    isResetOpen(type, id) {
      return this.resetTarget && this.resetTarget.type === type && this.resetTarget.id === id
    },
    async submitResetPassword() {
      try {
        this.clearMessages()
        if (!this.resetTarget) return
        if (this.resetTarget.type === 'employee') {
          await this.companyResetEmployeePassword(this.companyId, this.resetTarget.id, this.newPassword)
        } else if (this.resetTarget.type === 'customer') {
          await this.companyResetCustomerPassword(this.companyId, this.resetTarget.id, this.newPassword)
        }
        this.success = 'Password reset successfully'
        this.resetTarget = null
        this.newPassword = ''
      } catch (err) {
        this.error = err.response?.data?.error || err.message
      }
    },

    openEditCustomer(customer) {
      this.closeAllForms()
      this.clearMessages()
      this.editingCustomerId = customer._id
      this.customerForm = {
        customerName: customer.customerName || '',
        email: customer.account?.email || '',
        company: customer.company?._id || customer.company || this.companyId,
        profile: customer.profile || 'CUSTOMER_DEFAULT',
        billingInfo: (customer.billingInfo || []).map(b => ({
          label: b.label || 'default',
          customerName: b.customerName || '',
          address: b.address || '',
          postalCode: b.postalCode || '',
          city: b.city || '',
          VATnr: b.VATnr || '',
          isDefault: !!b.isDefault,
        })),
      }
    },
    cancelEditCustomer() {
      this.editingCustomerId = null
      this.customerForm = emptyCustomerForm()
    },
    addBillingItem() {
      this.customerForm.billingInfo.push(emptyBillingItem())
    },
    removeBillingItem(index) {
      this.customerForm.billingInfo.splice(index, 1)
    },
    setDefaultBillingItem(index) {
      this.customerForm.billingInfo = this.customerForm.billingInfo.map((item, i) => ({
        ...item,
        isDefault: i === index,
      }))
    },
    async submitCustomer() {
      try {
        this.clearMessages()
        await this.companyUpdateCustomer(this.companyId, this.editingCustomerId, this.customerForm)
        await this.getAllCustomers(this.companyId)
        this.editingCustomerId = null
        this.customerForm = emptyCustomerForm()
        this.success = 'Customer updated'
      } catch (err) {
        this.error = err.response?.data?.error || err.message
      }
    },
    async removeCustomer(customerId) {
      if (!confirm('Are you sure you want to delete this customer and their account?')) return
      try {
        this.clearMessages()
        await this.companyDeleteCustomer(this.companyId, customerId)
        await this.getAllCustomers(this.companyId)
        this.success = 'Customer deleted'
      } catch (err) {
        this.error = err.response?.data?.error || err.message
      }
    },

    openEditEmployee(employee) {
      this.closeAllForms()
      this.clearMessages()
      this.editingEmployeeId = employee._id
      this.employeeForm = {
        name: employee.name || '',
        email: employee.account?.email || '',
        profile: employee.profile || 'DISPATCHER',
      }
    },
    cancelEditEmployee() {
      this.editingEmployeeId = null
      this.employeeForm = emptyEmployeeForm()
    },
    async submitEmployee() {
      try {
        this.clearMessages()
        await this.companyUpdateEmployee(this.companyId, this.editingEmployeeId, this.employeeForm)
        await this.getAllEmployees(this.companyId)
        this.editingEmployeeId = null
        this.employeeForm = emptyEmployeeForm()
        this.success = 'Employee updated'
      } catch (err) {
        this.error = err.response?.data?.error || err.message
      }
    },
    async removeEmployee(employeeId) {
      if (!confirm('Are you sure you want to delete this employee and their account?')) return
      try {
        this.clearMessages()
        await this.companyDeleteEmployee(this.companyId, employeeId)
        await this.getAllEmployees(this.companyId)
        this.success = 'Employee deleted'
      } catch (err) {
        this.error = err.response?.data?.error || err.message
      }
    },

    openEditOrder(order) {
      this.closeAllForms()
      this.clearMessages()
      this.editingOrderId = order._id
      this.orderForm = {
        origin: order.origin || '',
        destination: order.destination || '',
        state: order.state || 'PENDING',
        deliveryDate: order.deliveryDate ? order.deliveryDate.substring(0, 10) : '',
      }
    },
    cancelEditOrder() {
      this.editingOrderId = null
      this.orderForm = emptyOrderForm()
    },
    async submitOrder() {
      try {
        this.clearMessages()
        await this.adminUpdateOrder(this.editingOrderId, this.orderForm)
        this.editingOrderId = null
        this.orderForm = emptyOrderForm()
        this.success = 'Order updated'
      } catch (err) {
        this.error = err.response?.data?.error || err.message
      }
    },
    async removeOrder(orderId) {
      if (!confirm('Are you sure you want to delete this order?')) return
      try {
        this.clearMessages()
        await this.adminDeleteOrder(orderId)
        this.success = 'Order deleted'
      } catch (err) {
        this.error = err.response?.data?.error || err.message
      }
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
    initials(name) {
      if (!name) return '?'
      return name
        .split(/[\s@]+/)
        .filter(Boolean)
        .slice(0, 2)
        .map(p => p[0]?.toUpperCase() || '')
        .join('')
    },
  },
  async mounted() {
    if (this.isAdmin) {
      await this.getAllCompanies()
    } else {
      await this.getCompany(this.companyId)
    }
    this.company = this.companies.find(c => c._id === this.companyId)
    const jobs = [
      this.getAllCustomers(this.companyId),
      this.getAllEmployees(this.companyId),
    ]
    if (this.isAdmin) jobs.push(this.adminGetAllOrders())
    await Promise.all(jobs)
  },
}
</script>

<template>
  <div v-if="company" class="company-detail">
    <PageHeader
      :title="company.companyName"
      :subtitle="`${company.address}, ${company.postalCode} ${company.city}`"
      :back-to="backTarget.to"
      :back-label="backTarget.label"
    >
      <template #actions>
        <router-link
          :to="`/companies/${companyId}/dispatcher`"
          class="kl-btn kl-btn--outline"
        >
          <Route :size="14" :stroke-width="1.75" /> Dispatcher
        </router-link>
        <router-link
          :to="`/companies/${companyId}/vehicles`"
          class="kl-btn kl-btn--outline"
        >
          <Truck :size="14" :stroke-width="1.75" /> Vehicles
        </router-link>
      </template>
    </PageHeader>

    <div v-if="error" class="kl-alert kl-alert--danger">{{ error }}</div>
    <div v-if="success" class="kl-alert kl-alert--success">{{ success }}</div>

    <!-- Customers -->
    <section class="kl-card kl-card--flush section">
      <div class="kl-card-header">
        <div>
          <h2>Customers</h2>
          <p class="kl-muted section__sub">Customers belonging to this company.</p>
        </div>
        <router-link :to="`/companies/${companyId}/customers`" class="kl-btn kl-btn--primary kl-btn--sm">
          <Plus :size="14" :stroke-width="2" /> Add customer
        </router-link>
      </div>

      <ul class="list">
        <li v-for="customer in customers" :key="customer._id" class="list-item">
          <div class="list-item__main">
            <div class="avatar">{{ initials(customer.customerName) }}</div>
            <div class="list-item__info">
              <div class="list-item__name">{{ customer.customerName }}</div>
              <div class="list-item__meta">{{ customer.account?.email }}</div>
            </div>
            <div v-if="canManage" class="list-item__actions">
              <button
                class="kl-btn kl-btn--ghost kl-btn--sm"
                title="Edit"
                @click="openEditCustomer(customer)"
              >
                <Pencil :size="14" :stroke-width="1.75" />
              </button>
              <button
                class="kl-btn kl-btn--ghost kl-btn--sm"
                title="Reset password"
                @click="openResetPassword('customer', customer._id)"
              >
                <Key :size="14" :stroke-width="1.75" />
              </button>
              <button
                class="kl-btn kl-btn--ghost kl-btn--sm danger-icon"
                title="Delete"
                @click="removeCustomer(customer._id)"
              >
                <Trash2 :size="14" :stroke-width="1.75" />
              </button>
            </div>
          </div>

          <div v-if="canManage && isResetOpen('customer', customer._id)" class="inline-panel">
            <form class="inline-panel__row" @submit.prevent="submitResetPassword">
              <div class="kl-field flex-grow">
                <label class="kl-label">New password</label>
                <input
                  v-model="newPassword"
                  class="kl-input"
                  type="password"
                  required
                  minlength="6"
                />
              </div>
              <div class="inline-panel__actions">
                <button type="submit" class="kl-btn kl-btn--primary">Save</button>
                <button type="button" class="kl-btn kl-btn--ghost" @click="cancelResetPassword">
                  Cancel
                </button>
              </div>
            </form>
          </div>

          <div v-if="canManage && editingCustomerId === customer._id" class="inline-panel">
            <form @submit.prevent="submitCustomer">
              <div class="kl-form-row">
                <div class="kl-field">
                  <label class="kl-label">Name</label>
                  <input v-model="customerForm.customerName" class="kl-input" required />
                </div>
                <div class="kl-field">
                  <label class="kl-label">Email</label>
                  <input v-model="customerForm.email" class="kl-input" type="email" required />
                </div>
              </div>
              <div class="kl-form-row" style="margin-top: 0.85rem">
                <div v-if="isAdmin" class="kl-field">
                  <label class="kl-label">Company</label>
                  <select v-model="customerForm.company" class="kl-select" required>
                    <option v-for="c in companies" :key="c._id" :value="c._id">
                      {{ c.companyName }}
                    </option>
                  </select>
                </div>
                <div class="kl-field">
                  <label class="kl-label">Profile</label>
                  <input v-model="customerForm.profile" class="kl-input" />
                </div>
              </div>

              <div class="billing-head">
                <h4>Billing info</h4>
                <button type="button" class="kl-btn kl-btn--outline kl-btn--sm" @click="addBillingItem">
                  <Plus :size="14" :stroke-width="2" /> Add billing
                </button>
              </div>

              <div
                v-for="(item, index) in customerForm.billingInfo"
                :key="index"
                class="billing-card"
              >
                <div class="kl-form-row">
                  <div class="kl-field">
                    <label class="kl-label">Label</label>
                    <input v-model="item.label" class="kl-input" />
                  </div>
                  <div class="kl-field">
                    <label class="kl-label">Billing name</label>
                    <input v-model="item.customerName" class="kl-input" required />
                  </div>
                </div>
                <div class="kl-form-row" style="margin-top: 0.85rem">
                  <div class="kl-field">
                    <label class="kl-label">Address</label>
                    <input v-model="item.address" class="kl-input" required />
                  </div>
                </div>
                <div class="kl-form-row" style="--cols: 1fr 1fr 1fr; margin-top: 0.85rem">
                  <div class="kl-field">
                    <label class="kl-label">Postal code</label>
                    <input v-model="item.postalCode" class="kl-input" required />
                  </div>
                  <div class="kl-field">
                    <label class="kl-label">City</label>
                    <input v-model="item.city" class="kl-input" required />
                  </div>
                  <div class="kl-field">
                    <label class="kl-label">VAT nr</label>
                    <input v-model="item.VATnr" class="kl-input" />
                  </div>
                </div>
                <div class="billing-actions">
                  <button
                    type="button"
                    class="kl-btn kl-btn--outline kl-btn--sm"
                    :disabled="item.isDefault"
                    @click="setDefaultBillingItem(index)"
                  >
                    {{ item.isDefault ? 'Default' : 'Set as default' }}
                  </button>
                  <button
                    type="button"
                    class="kl-btn kl-btn--ghost kl-btn--sm danger-icon"
                    @click="removeBillingItem(index)"
                  >
                    <Trash2 :size="14" :stroke-width="1.75" /> Remove
                  </button>
                </div>
              </div>

              <div class="inline-panel__actions">
                <button type="submit" class="kl-btn kl-btn--primary">Save</button>
                <button type="button" class="kl-btn kl-btn--ghost" @click="cancelEditCustomer">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </li>
        <li v-if="!customers.length" class="list__empty">No customers yet.</li>
      </ul>
    </section>

    <!-- Employees -->
    <section class="kl-card kl-card--flush section">
      <div class="kl-card-header">
        <div>
          <h2>Employees</h2>
          <p class="kl-muted section__sub">Dispatchers and company staff.</p>
        </div>
        <router-link :to="`/companies/${companyId}/employees`" class="kl-btn kl-btn--primary kl-btn--sm">
          <Plus :size="14" :stroke-width="2" /> Add employee
        </router-link>
      </div>

      <ul class="list">
        <li v-for="employee in employees" :key="employee._id" class="list-item">
          <div class="list-item__main">
            <div class="avatar">{{ initials(employee.name) }}</div>
            <div class="list-item__info">
              <div class="list-item__name">{{ employee.name }}</div>
              <div class="list-item__meta">{{ employee.profile }}</div>
            </div>
            <div v-if="canManage" class="list-item__actions">
              <button
                class="kl-btn kl-btn--ghost kl-btn--sm"
                title="Edit"
                @click="openEditEmployee(employee)"
              >
                <Pencil :size="14" :stroke-width="1.75" />
              </button>
              <button
                class="kl-btn kl-btn--ghost kl-btn--sm"
                title="Reset password"
                @click="openResetPassword('employee', employee._id)"
              >
                <Key :size="14" :stroke-width="1.75" />
              </button>
              <button
                class="kl-btn kl-btn--ghost kl-btn--sm danger-icon"
                title="Delete"
                @click="removeEmployee(employee._id)"
              >
                <Trash2 :size="14" :stroke-width="1.75" />
              </button>
            </div>
          </div>

          <div v-if="canManage && isResetOpen('employee', employee._id)" class="inline-panel">
            <form class="inline-panel__row" @submit.prevent="submitResetPassword">
              <div class="kl-field flex-grow">
                <label class="kl-label">New password</label>
                <input
                  v-model="newPassword"
                  class="kl-input"
                  type="password"
                  required
                  minlength="6"
                />
              </div>
              <div class="inline-panel__actions">
                <button type="submit" class="kl-btn kl-btn--primary">Save</button>
                <button type="button" class="kl-btn kl-btn--ghost" @click="cancelResetPassword">
                  Cancel
                </button>
              </div>
            </form>
          </div>

          <div v-if="canManage && editingEmployeeId === employee._id" class="inline-panel">
            <form @submit.prevent="submitEmployee">
              <div class="kl-form-row">
                <div class="kl-field">
                  <label class="kl-label">Name</label>
                  <input v-model="employeeForm.name" class="kl-input" required />
                </div>
                <div class="kl-field">
                  <label class="kl-label">Email</label>
                  <input v-model="employeeForm.email" class="kl-input" type="email" required />
                </div>
              </div>
              <div class="kl-form-row" style="margin-top: 0.85rem; --cols: 1">
                <div class="kl-field">
                  <label class="kl-label">Profile</label>
                  <input v-model="employeeForm.profile" class="kl-input" />
                </div>
              </div>
              <div class="inline-panel__actions">
                <button type="submit" class="kl-btn kl-btn--primary">Save</button>
                <button type="button" class="kl-btn kl-btn--ghost" @click="cancelEditEmployee">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </li>
        <li v-if="!employees.length" class="list__empty">No employees yet.</li>
      </ul>
    </section>

    <!-- Orders (admin-only) -->
    <section v-if="isAdmin" class="kl-card kl-card--flush section">
      <div class="kl-card-header">
        <div>
          <h2>Orders</h2>
          <p class="kl-muted section__sub">All transport orders for this company.</p>
        </div>
        <span class="kl-badge kl-badge--muted">{{ companyOrders.length }}</span>
      </div>

      <ul v-if="companyOrders.length" class="list">
        <li v-for="order in companyOrders" :key="order._id" class="list-item">
          <div class="list-item__main order-main">
            <div class="order-main__route">
              <span class="order-main__arrow">{{ order.origin }} <ChevronRight :size="14" :stroke-width="1.75" /> {{ order.destination }}</span>
              <div class="order-main__meta">
                <span>{{ order.customer?.customerName || '' }}</span>
                <span>&middot;</span>
                <span>{{ formatDate(order.deliveryDate) }}</span>
              </div>
            </div>
            <span :class="orderBadgeClass(order.state)">{{ order.state }}</span>
            <div class="list-item__actions">
              <button
                class="kl-btn kl-btn--ghost kl-btn--sm"
                title="Edit"
                @click="openEditOrder(order)"
              >
                <Pencil :size="14" :stroke-width="1.75" />
              </button>
              <button
                class="kl-btn kl-btn--ghost kl-btn--sm danger-icon"
                title="Delete"
                @click="removeOrder(order._id)"
              >
                <Trash2 :size="14" :stroke-width="1.75" />
              </button>
            </div>
          </div>

          <div v-if="editingOrderId === order._id" class="inline-panel">
            <form @submit.prevent="submitOrder">
              <div class="kl-form-row">
                <div class="kl-field">
                  <label class="kl-label">Origin</label>
                  <input v-model="orderForm.origin" class="kl-input" required />
                </div>
                <div class="kl-field">
                  <label class="kl-label">Destination</label>
                  <input v-model="orderForm.destination" class="kl-input" required />
                </div>
              </div>
              <div class="kl-form-row" style="margin-top: 0.85rem">
                <div class="kl-field">
                  <label class="kl-label">Delivery date</label>
                  <input v-model="orderForm.deliveryDate" class="kl-input" type="date" required />
                </div>
                <div class="kl-field">
                  <label class="kl-label">Status</label>
                  <select v-model="orderForm.state" class="kl-select">
                    <option value="PENDING">PENDING</option>
                    <option value="IN_PROCESS">IN_PROCESS</option>
                    <option value="DELIVERED">DELIVERED</option>
                  </select>
                </div>
              </div>
              <div class="inline-panel__actions">
                <button type="submit" class="kl-btn kl-btn--primary">Save</button>
                <button type="button" class="kl-btn kl-btn--ghost" @click="cancelEditOrder">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </li>
      </ul>
      <div v-else class="list__empty">No orders for this company yet.</div>
    </section>
  </div>

  <div v-else class="loading-wrap">
    <PageHeader title="Company" subtitle="Loading..." />
  </div>
</template>

<style scoped>
.company-detail {
  padding-bottom: 2.5rem;
}

.section + .section {
  margin-top: 1.25rem;
}

.section__sub {
  margin: 0.25rem 0 0;
  font-size: 0.85rem;
}

.list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.list-item {
  border-bottom: 1px solid var(--color-border);
  padding: 0.85rem 1.25rem;
}

.list-item:last-child {
  border-bottom: none;
}

.list-item__main {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.list-item__info {
  min-width: 0;
  flex: 1;
}

.list-item__name {
  font-weight: 500;
  color: var(--color-heading);
}

.list-item__meta {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  margin-top: 0.15rem;
}

.list-item__actions {
  display: flex;
  gap: 0.25rem;
}

.order-main__route {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  flex: 1;
  min-width: 0;
}

.order-main__arrow {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  color: var(--color-heading);
  font-weight: 500;
  flex-wrap: wrap;
}

.order-main__meta {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  display: flex;
  gap: 0.35rem;
  align-items: center;
  flex-wrap: wrap;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--color-primary-soft);
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.8rem;
  flex-shrink: 0;
}

.danger-icon:hover {
  color: var(--color-danger);
  background: var(--color-danger-soft);
}

.inline-panel {
  margin-top: 0.85rem;
  padding: 1rem;
  background: var(--color-background-subtle);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
}

.inline-panel__row {
  display: flex;
  align-items: flex-end;
  gap: 0.75rem;
}

.inline-panel__actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.flex-grow { flex: 1; }

.billing-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
}

.billing-head h4 {
  margin: 0;
  font-size: 0.95rem;
}

.billing-card {
  padding: 0.85rem;
  background: var(--color-background-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  margin-bottom: 0.75rem;
}

.billing-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.85rem;
  justify-content: space-between;
}

.list__empty {
  padding: 1.5rem 1.25rem;
  text-align: center;
  color: var(--color-text-secondary);
  font-style: italic;
}

.loading-wrap {
  padding-bottom: 2rem;
}
</style>
