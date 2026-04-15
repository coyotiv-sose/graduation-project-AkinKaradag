<script>
import { mapState, mapActions } from 'pinia'
import { useCompanyStore } from '@/stores/company-store'

export default {
  name: 'CompanyList',
  computed: {
    ...mapState(useCompanyStore, ['companies']),
  },
  methods: {
    ...mapActions(useCompanyStore, ['getAllCompanies']),
  },
  async mounted() {
    await this.getAllCompanies()
  },
}
</script>

<template lang="pug">
.card
  .card-header
    h2.mb-0 Companies
  .list-group.list-group-flush
    router-link.list-group-item.list-group-item-action(
      v-for='company in companies'
      :key='company._id'
      :to='`/companies/${company._id}`'
    )
      .d-flex.justify-content-between.align-items-center
        span.fw-semibold {{ company.companyName }}
        span.text-secondary {{ company.city }}
</template>
