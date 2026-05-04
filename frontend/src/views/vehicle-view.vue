<script>
import VehicleManagement from '@/components/vehicle-management.vue'
import PageHeader from '@/components/page-header.vue'

export default {
  name: 'VehicleView',
  components: { VehicleManagement, PageHeader },
  computed: {
    companyId() {
      return this.$route.params.companyId
    },
  },
}
</script>

<template lang="pug">
  .vehicle-view
    PageHeader(
      title="Manage vehicles"
      subtitle="Add vehicles to your fleet and adjust their state."
      :back-to="`/companies/${companyId}`"
      back-label="Back to company"
    )
    Suspense
      VehicleManagement(:company-id="companyId")
</template>

<style scoped>
.vehicle-view {
  padding-bottom: 2rem;
}
</style>
