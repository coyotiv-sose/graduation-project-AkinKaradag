<script>
import VehicleManagement from '@/components/vehicle-management.vue'
export default {
  components: { VehicleManagement },
  computed: {
    companyId() {
      return this.$route.params.companyId
    },
  },
}
</script>

<template>
  <main>
    <h1>Manage Vehicles</h1>
    <router-link :to="`/companies/${companyId}`">← Back to Company</router-link>
    <Suspense>
      <VehicleManagement :companyId="companyId" />
    </Suspense>
  </main>
</template>

<style scoped>
main {
  max-width: 700px;
  margin: 0 auto;
  padding: 2rem;
}
</style>
