<script>
import axios from 'axios'

export default {
  name: 'LoginView',
    data() {
        return {
            email: '',
            password: '',
        }
    },
    methods: {
        async login() {
            await axios.post('/accounts/session', { email: this.email, password: this.password })
            this.$router.push('/')
            this.$root.fetchUser()
        }
    }
}
</script>

<template lang="pug">
h1 Login
form(@submit.prevent='login')
    div
        input(v-model='email' placeholder='Email')
    div
        input(v-model='password' type='password' placeholder='Password')
    div
        button(type='submit') Login
</template> 