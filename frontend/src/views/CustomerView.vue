<script>
import Customer from '@/components/Customer.vue'
export default {
  components: { Customer },
  computed: {
    companyId() {
      return this.$route.params.companyId
    },
  },
}
</script>

<template>
  <main>
    <h1>Manage Customers</h1>
    <router-link :to="`/companies/${companyId}`">← Back to Company</router-link>
    <Suspense>
      <Customer :companyId="companyId" />
    </Suspense>
  </main>
</template>
