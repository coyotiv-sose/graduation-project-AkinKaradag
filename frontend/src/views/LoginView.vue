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
.container.mt-5
  .row.justify-content-center
    .col-md-6
      h1.mb-4 Login
      form(@submit.prevent='login')
        .mb-3
          label.form-label(for='email') Email address
          input#email.form-control(v-model='email' type='email' placeholder='name@example.com')
        .mb-3
          label.form-label(for='password') Password
          input#password.form-control(v-model='password' type='password' placeholder='Password')
        button.btn.btn-success(type='submit') Login
</template>