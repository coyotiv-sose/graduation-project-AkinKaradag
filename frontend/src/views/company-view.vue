<script>
import Company from '@/components/entities/company.vue'
import PageHeader from '@/components/layout/page-header.vue'

export default {
  name: 'CompanyView',
  components: { Company, PageHeader },
}
</script>


<template lang="pug">
div.company-view
  PageHeader(
    title="Companies"
    subtitle="Every logistics operator on the RouteWerk platform."
  )
  Suspense
    Company
</template>

<style scoped>
.company-view {
  padding-bottom: 2rem;
}
</style>
