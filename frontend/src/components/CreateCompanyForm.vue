<script>
import axios from 'axios'
import CreateFormWrapper from './CreateFormWrapper.vue'

export default {
  name: 'CreateCompanyForm',
  components: { CreateFormWrapper },
  data() {
    return {
      companyName: '',
      address: '',
      postalCode: '',
      city: '',
    }
  },
  methods: {
    async submitCompany() {
      await axios.post('/companies', {
        companyName: this.companyName,
        address: this.address,
        postalCode: this.postalCode,
        city: this.city,
      })
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
</template>
