<script>
import DispatcherDashboard from '@/components/dispatcher/dispatcher-dashboard.vue'
import PageHeader from '@/components/layout/page-header.vue'

export default {
  name: 'DispatcherDashboardView',
  components: { DispatcherDashboard, PageHeader },
  computed: {
    companyId() {
      return this.$route.params.companyId
    },
  },
}
</script>


<template lang="pug">
div.dispatcher-view
  PageHeader(
    title="Dispatcher hub"
    subtitle="Monitor pending orders, plan tours and assign vehicles in real time."
    :back-to="`/companies/${companyId}`"
    back-label="Back to company"
  )
  DispatcherDashboard(:company-id="companyId")
</template>

<style scoped>
.dispatcher-view {
  padding-bottom: 2rem;
}
</style>
