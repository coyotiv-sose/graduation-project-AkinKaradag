<script>
import DispatcherDashboard from '@/components/dispatcher-dashboard.vue'
export default {
  components: { DispatcherDashboard },
  computed: {
    companyId() {
      return this.$route.params.companyId
    },
  },
}
</script>

<template>
  <main>
    <router-link :to="`/companies/${companyId}`">← Back to Company</router-link>
    <Suspense>
      <DispatcherDashboard :companyId="companyId" />
    </Suspense>
  </main>
</template>

<style scoped>
main {
  max-width: 1100px;
  margin: 0 auto;
  padding: 2rem;
}
</style>
