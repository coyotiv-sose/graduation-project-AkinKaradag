<script>
import { useCompanyStore } from '@/stores/companyStore';
import CreateFormWrapper from './CreateFormWrapper.vue'

export default {
  name: 'CompanyForm',
  components: { CreateFormWrapper },
  data() {
    return {
      companyName: '',
      address: '',
      postalCode: '',
      city: '',
    }
  },

  computed: {
    companies() {
      return useCompanyStore().companies
    }
  },

  async mounted() {
    await useCompanyStore().getAllCompanies()
  },

  methods: {
    async submitCompany() {
      await useCompanyStore().createCompany({
        companyName: this.companyName,
        address: this.address,
        postalCode: this.postalCode,
        city: this.city,
      })
      this.companyName = ''
      this.address = ''
      this.postalCode = ''
      this.city = ''
    },
  },
}
</script>

<template lang="pug">
CreateFormWrapper(:onSubmit='submitCompany', submitLabel='Create company')
  input(v-model='companyName' placeholder='Company Name')
  input(v-model='address' placeholder='Address')
  input(v-model='postalCode' placeholder='PostalCode')
  input(v-model='city' placeholder='City')

h2 Companies
ul
   li(v-for='company in companies' :key='company._id')
    | {{ company.companyName }} - {{ company.city }}

</template>
