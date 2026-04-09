<script>
import { mapActions } from 'pinia'
import { useAccountStore } from '../stores/accountStore'

export default {
  name: 'LogoutView',
  methods: {
    ...mapActions(useAccountStore, ['logout']),
  },
  async mounted() {
    await this.logout()
    this.$router.push('/')
  },
}
</script>

<template lang="pug">
p Logging out...
</template>
