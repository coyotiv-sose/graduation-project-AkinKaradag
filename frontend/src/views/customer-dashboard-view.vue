<script>
import Customer from '@/components/entities/customer.vue'
import PageHeader from '@/components/layout/page-header.vue'

export default {
  name: 'CustomerDashboardView',
  components: { Customer, PageHeader },
  computed: {
    companyId() {
      return this.$route.params.companyId
    },
  },
}
</script>


<template lang="pug">
div.customer-dashboard
  PageHeader(
    title="Manage customers"
    subtitle="Add customers to this company and view their accounts."
    :back-to="`/companies/${companyId}`"
    back-label="Back to company"
  )
  Suspense
    Customer(:company-id="companyId")
</template>

<style scoped>
.customer-dashboard {
  padding-bottom: 2rem;
}
</style>
