<script>
import Employee from '@/components/Employee.vue'
export default {
  components: { Employee },
  computed: {
    companyId() {
      return this.$route.params.companyId
    },
  },
}
</script>

<template>
  <main>
    <h1>Manage Employees</h1>
    <router-link :to="`/companies/${companyId}`">← Back to Company</router-link>
    <Suspense>
      <Employee :companyId="companyId" />
    </Suspense>
  </main>
</template>
