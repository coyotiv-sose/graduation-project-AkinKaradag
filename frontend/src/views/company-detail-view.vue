<script>
import { mapState, mapActions } from 'pinia'
import { useCompanyStore } from '@/stores/company-store'
import { useCustomerStore } from '@/stores/customer-store'
import { useEmployeeStore } from '@/stores/employee-store'
import { useAccountStore } from '@/stores/account-store'
import { useAdminStore } from '@/stores/admin-store'
import PageHeader from '@/components/layout/page-header.vue'
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


<template lang="pug">
div.company-detail(v-if="company")
  PageHeader(
    :title="company.companyName"
    :subtitle="`${company.address}, ${company.postalCode} ${company.city}`"
    :back-to="backTarget.to"
    :back-label="backTarget.label"
  )
    template(#actions)
      router-link.kl-btn.kl-btn--outline(:to="`/companies/${companyId}/dispatcher`")
        Route(:size="14", :stroke-width="1.75")
        | Dispatcher
      router-link.kl-btn.kl-btn--outline(:to="`/companies/${companyId}/vehicles`")
        Truck(:size="14", :stroke-width="1.75")
        | Vehicles
  div.kl-alert.kl-alert--danger(v-if="error") {{ error }}
  div.kl-alert.kl-alert--success(v-if="success") {{ success }}
  // Customers
  section.kl-card.kl-card--flush.section
    .kl-card-header
      div
        h2 Customers
        p.kl-muted.section__sub Customers belonging to this company.
      router-link.kl-btn.kl-btn--primary.kl-btn--sm(:to="`/companies/${companyId}/customers`")
        Plus(:size="14", :stroke-width="2")
        | Add customer
    ul.list
      li.list-item(v-for="customer in customers", :key="customer._id")
        .list-item__main
          .avatar {{ initials(customer.customerName) }}
          .list-item__info
            .list-item__name {{ customer.customerName }}
            .list-item__meta {{ customer.account?.email }}
          .list-item__actions(v-if="canManage")
            button.kl-btn.kl-btn--ghost.kl-btn--sm(title="Edit", @click="openEditCustomer(customer)")
              Pencil(:size="14", :stroke-width="1.75")
            button.kl-btn.kl-btn--ghost.kl-btn--sm(title="Reset password", @click="openResetPassword('customer', customer._id)")
              Key(:size="14", :stroke-width="1.75")
            button.kl-btn.kl-btn--ghost.kl-btn--sm.danger-icon(title="Delete", @click="removeCustomer(customer._id)")
              Trash2(:size="14", :stroke-width="1.75")
        .inline-panel(v-if="canManage && isResetOpen('customer', customer._id)")
          form.inline-panel__row(@submit.prevent="submitResetPassword")
            .kl-field.flex-grow
              label.kl-label New password
              input.kl-input(v-model="newPassword", type="password", required, minlength="6")
            .inline-panel__actions
              button.kl-btn.kl-btn--primary(type="submit") Save
              button.kl-btn.kl-btn--ghost(type="button", @click="cancelResetPassword") Cancel
        .inline-panel(v-if="canManage && editingCustomerId === customer._id")
          form(@submit.prevent="submitCustomer")
            .kl-form-row
              .kl-field
                label.kl-label Name
                input.kl-input(v-model="customerForm.customerName", required)
              .kl-field
                label.kl-label Email
                input.kl-input(v-model="customerForm.email", type="email", required)
            .kl-form-row(style="margin-top: 0.85rem")
              .kl-field(v-if="isAdmin")
                label.kl-label Company
                select.kl-select(v-model="customerForm.company", required)
                  option(v-for="c in companies", :key="c._id", :value="c._id") {{ c.companyName }}
              .kl-field
                label.kl-label Profile
                input.kl-input(v-model="customerForm.profile")
            .billing-head
              h4 Billing info
              button.kl-btn.kl-btn--outline.kl-btn--sm(type="button", @click="addBillingItem")
                Plus(:size="14", :stroke-width="2")
                | Add billing
            div.billing-card(v-for="(item, index) in customerForm.billingInfo", :key="index")
              .kl-form-row
                .kl-field
                  label.kl-label Label
                  input.kl-input(v-model="item.label")
                .kl-field
                  label.kl-label Billing name
                  input.kl-input(v-model="item.customerName", required)
              .kl-form-row(style="margin-top: 0.85rem")
                .kl-field
                  label.kl-label Address
                  input.kl-input(v-model="item.address", required)
              .kl-form-row(style="--cols: 1fr 1fr 1fr; margin-top: 0.85rem")
                .kl-field
                  label.kl-label Postal code
                  input.kl-input(v-model="item.postalCode", required)
                .kl-field
                  label.kl-label City
                  input.kl-input(v-model="item.city", required)
                .kl-field
                  label.kl-label VAT nr
                  input.kl-input(v-model="item.VATnr")
              .billing-actions
                button.kl-btn.kl-btn--outline.kl-btn--sm(type="button", :disabled="item.isDefault", @click="setDefaultBillingItem(index)") {{ item.isDefault ? 'Default' : 'Set as default' }}
                button.kl-btn.kl-btn--ghost.kl-btn--sm.danger-icon(type="button", @click="removeBillingItem(index)")
                  Trash2(:size="14", :stroke-width="1.75")
                  | Remove
            .inline-panel__actions
              button.kl-btn.kl-btn--primary(type="submit") Save
              button.kl-btn.kl-btn--ghost(type="button", @click="cancelEditCustomer") Cancel
      li.list__empty(v-if="!customers.length") No customers yet.
  // Employees
  section.kl-card.kl-card--flush.section
    .kl-card-header
      div
        h2 Employees
        p.kl-muted.section__sub Dispatchers and company staff.
      router-link.kl-btn.kl-btn--primary.kl-btn--sm(:to="`/companies/${companyId}/employees`")
        Plus(:size="14", :stroke-width="2")
        | Add employee
    ul.list
      li.list-item(v-for="employee in employees", :key="employee._id")
        .list-item__main
          .avatar {{ initials(employee.name) }}
          .list-item__info
            .list-item__name {{ employee.name }}
            .list-item__meta {{ employee.profile }}
          .list-item__actions(v-if="canManage")
            button.kl-btn.kl-btn--ghost.kl-btn--sm(title="Edit", @click="openEditEmployee(employee)")
              Pencil(:size="14", :stroke-width="1.75")
            button.kl-btn.kl-btn--ghost.kl-btn--sm(title="Reset password", @click="openResetPassword('employee', employee._id)")
              Key(:size="14", :stroke-width="1.75")
            button.kl-btn.kl-btn--ghost.kl-btn--sm.danger-icon(title="Delete", @click="removeEmployee(employee._id)")
              Trash2(:size="14", :stroke-width="1.75")
        .inline-panel(v-if="canManage && isResetOpen('employee', employee._id)")
          form.inline-panel__row(@submit.prevent="submitResetPassword")
            .kl-field.flex-grow
              label.kl-label New password
              input.kl-input(v-model="newPassword", type="password", required, minlength="6")
            .inline-panel__actions
              button.kl-btn.kl-btn--primary(type="submit") Save
              button.kl-btn.kl-btn--ghost(type="button", @click="cancelResetPassword") Cancel
        .inline-panel(v-if="canManage && editingEmployeeId === employee._id")
          form(@submit.prevent="submitEmployee")
            .kl-form-row
              .kl-field
                label.kl-label Name
                input.kl-input(v-model="employeeForm.name", required)
              .kl-field
                label.kl-label Email
                input.kl-input(v-model="employeeForm.email", type="email", required)
            .kl-form-row(style="margin-top: 0.85rem; --cols: 1")
              .kl-field
                label.kl-label Profile
                input.kl-input(v-model="employeeForm.profile")
            .inline-panel__actions
              button.kl-btn.kl-btn--primary(type="submit") Save
              button.kl-btn.kl-btn--ghost(type="button", @click="cancelEditEmployee") Cancel
      li.list__empty(v-if="!employees.length") No employees yet.
  // Orders (admin-only)
  section.kl-card.kl-card--flush.section(v-if="isAdmin")
    .kl-card-header
      div
        h2 Orders
        p.kl-muted.section__sub All transport orders for this company.
      span.kl-badge.kl-badge--muted {{ companyOrders.length }}
    ul.list(v-if="companyOrders.length")
      li.list-item(v-for="order in companyOrders", :key="order._id")
        .list-item__main.order-main
          .order-main__route
            span.order-main__arrow
              | {{ order.origin }}
              ChevronRight(:size="14", :stroke-width="1.75")
              | {{ order.destination }}
            .order-main__meta
              span {{ order.customer?.customerName || '' }}
              span &middot;
              span {{ formatDate(order.deliveryDate) }}
          span(:class="orderBadgeClass(order.state)") {{ order.state }}
          .list-item__actions
            button.kl-btn.kl-btn--ghost.kl-btn--sm(title="Edit", @click="openEditOrder(order)")
              Pencil(:size="14", :stroke-width="1.75")
            button.kl-btn.kl-btn--ghost.kl-btn--sm.danger-icon(title="Delete", @click="removeOrder(order._id)")
              Trash2(:size="14", :stroke-width="1.75")
        .inline-panel(v-if="editingOrderId === order._id")
          form(@submit.prevent="submitOrder")
            .kl-form-row
              .kl-field
                label.kl-label Origin
                input.kl-input(v-model="orderForm.origin", required)
              .kl-field
                label.kl-label Destination
                input.kl-input(v-model="orderForm.destination", required)
            .kl-form-row(style="margin-top: 0.85rem")
              .kl-field
                label.kl-label Delivery date
                input.kl-input(v-model="orderForm.deliveryDate", type="date", required)
              .kl-field
                label.kl-label Status
                select.kl-select(v-model="orderForm.state")
                  option(value="PENDING") PENDING
                  option(value="IN_PROCESS") IN_PROCESS
                  option(value="DELIVERED") DELIVERED
            .inline-panel__actions
              button.kl-btn.kl-btn--primary(type="submit") Save
              button.kl-btn.kl-btn--ghost(type="button", @click="cancelEditOrder") Cancel
    div.list__empty(v-else) No orders for this company yet.
div.loading-wrap(v-else)
  PageHeader(title="Company", subtitle="Loading...")
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
