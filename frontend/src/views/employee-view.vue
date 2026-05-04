<script>
import Employee from '@/components/employee.vue'
import PageHeader from '@/components/page-header.vue'

export default {
  name: 'EmployeeView',
  components: { Employee, PageHeader },
  computed: {
    companyId() {
      return this.$route.params.companyId
    },
  },
}
</script>


<template lang="pug">
div.employee-view
  PageHeader(
    title="Manage employees"
    subtitle="Add dispatchers and staff to this company."
    :back-to="`/companies/${companyId}`"
    back-label="Back to company"
  )
  Suspense
    Employee(:company-id="companyId")
</template>

<style scoped>
.employee-view {
  padding-bottom: 2rem;
}
</style>
