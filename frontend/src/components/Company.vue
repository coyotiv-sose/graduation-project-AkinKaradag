<script>
import { useCompanyStore } from '@/stores/companyStore'

export default {
  name: 'CompanyList',
  computed: {
    companies() {
      return useCompanyStore().companies
    },
  },
  async mounted() {
    await useCompanyStore().getAllCompanies()
  },
}
</script>

<template lang="pug">
h2 Companies
ul
  li(v-for='company in companies' :key='company._id')
    router-link(:to='`/companies/${company._id}`')
      | {{ company.companyName }} - {{ company.city }}
</template>
