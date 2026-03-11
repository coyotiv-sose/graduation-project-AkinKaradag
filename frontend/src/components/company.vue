<script>
import axios from 'axios'
import CreateFormWrapper from './CreateFormWrapper.vue'

export default {
  name: 'CreateCompanyForm',
  components: { CreateFormWrapper },
  data() {
    return {
      companies: [],
      companyName: '',
      address: '',
      postalCode: '',
      city: '',
    }
  },

  async mounted() {
    await this.getAllCompanies()
  },

  methods: {
    async getAllCompanies() {
      const { data } = await axios.get('/companies')
      this.companies = data
    },
    async submitCompany() {
      await axios.post('/companies', {
        companyName: this.companyName,
        address: this.address,
        postalCode: this.postalCode,
        city: this.city,
      })
      this.companyName = ''
      this.address = ''
      this.postalCode = ''
      this.city = ''
      await this.getAllCompanies()
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
