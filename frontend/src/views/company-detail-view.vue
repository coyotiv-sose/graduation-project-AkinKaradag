<script>
import { mapState, mapActions } from 'pinia'
import { useCompanyStore } from '@/stores/company-store'
import { useCustomerStore } from '@/stores/customer-store'
import { useEmployeeStore } from '@/stores/employee-store'
import { useAccountStore } from '@/stores/account-store'
import { useAdminStore } from '@/stores/admin-store'
import PageHeader from '@/components/layout/page-header.vue'
import CompanyCustomersPanel from '@/components/company/company-customers-panel.vue'
import CompanyEmployeesPanel from '@/components/company/company-employees-panel.vue'
import CompanyOrdersPanel from '@/components/company/company-orders-panel.vue'
import { Route, Truck } from 'lucide-vue-next'

export default {
  name: 'CompanyDetailView',
  components: {
    CompanyCustomersPanel,
    CompanyEmployeesPanel,
    CompanyOrdersPanel,
    PageHeader,
    Route,
    Truck,
  },
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
    ...mapState(useAccountStore, {
      accountCompanyId: 'companyId',
      isAdmin: 'isAdmin',
      isEmployee: 'isEmployee',
    }),
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
      if (this.isAdmin) {
        return { to: { name: 'admin' }, label: 'Back to admin dashboard' }
      }
      if (this.isEmployee && this.accountCompanyId) {
        return {
          to: { name: 'dispatcher', params: { companyId: this.accountCompanyId } },
          label: 'Back to dispatcher',
        }
      }
      return { to: { name: 'home' }, label: 'Back' }
    },
  },
  methods: {
    ...mapActions(useCompanyStore, ['getAllCompanies', 'getCompany']),
    ...mapActions(useCustomerStore, {
      loadCustomers: 'getAllCustomers',
    }),
    ...mapActions(useEmployeeStore, {
      loadEmployees: 'getAllEmployees',
    }),
    ...mapActions(useAdminStore, {
      loadOrders: 'getAllOrders',
    }),
    async loadCompanyData() {
      if (this.isAdmin) {
        await this.getAllCompanies()
      } else {
        await this.getCompany(this.companyId)
      }
      this.company = this.companies.find(company => company._id === this.companyId)

      const jobs = [
        this.loadCustomers(this.companyId),
        this.loadEmployees(this.companyId),
      ]

      if (this.isAdmin) {
        jobs.push(this.loadOrders())
      }

      await Promise.all(jobs)
    },
  },
  async mounted() {
    await this.loadCompanyData()
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
  .company-detail__panels
    CompanyCustomersPanel(
      :customers="customers"
      :companies="companies"
      :company-id="companyId"
      :can-manage="canManage"
      :is-admin="isAdmin"
    )
    CompanyEmployeesPanel(
      :employees="employees"
      :company-id="companyId"
      :can-manage="canManage"
    )
    CompanyOrdersPanel(
      v-if="isAdmin"
      :company-orders="companyOrders"
    )
div.loading-wrap(v-else)
  PageHeader(title="Company", subtitle="Loading...")
</template>

<style scoped>
.company-detail {
  padding-bottom: 2.5rem;
}

.company-detail__panels {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.loading-wrap {
  padding-bottom: 2rem;
}
</style>
