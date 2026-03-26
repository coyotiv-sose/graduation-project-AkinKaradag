<script>
import { useAccountStore } from '../stores/accountStore'

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
            await useAccountStore().login(this.email, this.password)
            this.$router.push('/')
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