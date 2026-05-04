<script>
import { mapState, mapActions } from 'pinia'
import { useCompanyStore } from '@/stores/company-store'
import { useCustomerStore } from '@/stores/customer-store'
import { useEmployeeStore } from '@/stores/employee-store'
import { useAccountStore } from '@/stores/account-store'
import { useAdminStore } from '@/stores/admin-store'
import PageHeader from '@/components/page-header.vue'
import CompanyCustomersSection from '@/components/company-detail/company-customers-section.vue'
import CompanyEmployeesSection from '@/components/company-detail/company-employees-section.vue'
import CompanyOrdersSection from '@/components/company-detail/company-orders-section.vue'
import { Route, Truck } from 'lucide-vue-next'
import { apiErrorMessage } from '@/utils/error-helpers'

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
    PageHeader,
    CompanyCustomersSection,
    CompanyEmployeesSection,
    CompanyOrdersSection,
    Route,
    Truck,
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
        this.error = apiErrorMessage(err)
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
    async submitCustomer() {
      try {
        this.clearMessages()
        await this.companyUpdateCustomer(this.companyId, this.editingCustomerId, this.customerForm)
        await this.getAllCustomers(this.companyId)
        this.editingCustomerId = null
        this.customerForm = emptyCustomerForm()
        this.success = 'Customer updated'
      } catch (err) {
        this.error = apiErrorMessage(err)
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
        this.error = apiErrorMessage(err)
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
        this.error = apiErrorMessage(err)
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
        this.error = apiErrorMessage(err)
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
        this.error = apiErrorMessage(err)
      }
    },
    async removeOrder(orderId) {
      if (!confirm('Are you sure you want to delete this order?')) return
      try {
        this.clearMessages()
        await this.adminDeleteOrder(orderId)
        this.success = 'Order deleted'
      } catch (err) {
        this.error = apiErrorMessage(err)
      }
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
  CompanyCustomersSection(
    :customers="customers"
    :companies="companies"
    :company-id="companyId"
    :can-manage="canManage"
    :is-admin="isAdmin"
    :editing-customer-id="editingCustomerId"
    :customer-form="customerForm"
    :reset-target="resetTarget"
    :new-password="newPassword"
    @edit-customer="openEditCustomer"
    @delete-customer="removeCustomer"
    @reset-password="openResetPassword"
    @submit-reset-password="submitResetPassword"
    @cancel-reset-password="cancelResetPassword"
    @update-new-password="newPassword = $event"
    @update-customer-form="customerForm = $event"
    @submit-customer="submitCustomer"
    @cancel-customer="cancelEditCustomer"
  )
  CompanyEmployeesSection(
    :employees="employees"
    :company-id="companyId"
    :can-manage="canManage"
    :editing-employee-id="editingEmployeeId"
    :employee-form="employeeForm"
    :reset-target="resetTarget"
    :new-password="newPassword"
    @edit-employee="openEditEmployee"
    @delete-employee="removeEmployee"
    @reset-password="openResetPassword"
    @submit-reset-password="submitResetPassword"
    @cancel-reset-password="cancelResetPassword"
    @update-new-password="newPassword = $event"
    @update-employee-form="employeeForm = $event"
    @submit-employee="submitEmployee"
    @cancel-employee="cancelEditEmployee"
  )
  CompanyOrdersSection(
    v-if="isAdmin"
    :orders="companyOrders"
    :editing-order-id="editingOrderId"
    :order-form="orderForm"
    @edit-order="openEditOrder"
    @delete-order="removeOrder"
    @update-order-form="orderForm = $event"
    @submit-order="submitOrder"
    @cancel-order="cancelEditOrder"
  )
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

.loading-wrap {
  padding-bottom: 2rem;
}
</style>
