<script>
import { useAccountStore } from '../stores/accountStore'

export default {
  name: 'RegisterView',
  data() {
    return {
      email: '',
      password: '',
      name: '',
      role: 'customer',
    }
  },
  methods: {
    async register() {
      const payload = {
        email: this.email,
        password: this.password,
        role: this.role,
      }
      if (this.role === 'customer') {
        payload.customerName = this.name
      } else {
        payload.name = this.name
      }
      await useAccountStore().register(payload)
      alert('Registration successful!')
      this.$router.push('/login')
    },
  },
}
</script>

<template lang="pug">
h1 Register
form(@submit.prevent='register')
    div
        input(v-model='email' placeholder='Email')
    div
        input(v-model='password' type='password' placeholder='Password')
    div
        input(v-model='name' :placeholder="role === 'customer' ? 'Customer Name' : 'Employee Name'")
    div
        select(v-model='role')
            option(value='customer') Customer
            option(value='employee') Employee
    div
        button(type='submit') Register
</template>
