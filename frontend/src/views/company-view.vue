<script>
import Company from '@/components/company.vue'
import PageHeader from '@/components/page-header.vue'

export default {
  name: 'CompanyView',
  components: { Company, PageHeader },
}
</script>

<template>
  <div class="company-view">
    <PageHeader
      title="Companies"
      subtitle="Every logistics operator on the KaraLog platform."
    />
    <Suspense>
      <Company />
    </Suspense>
  </div>
</template>

<style scoped>
.company-view {
  padding-bottom: 2rem;
}
</style>
