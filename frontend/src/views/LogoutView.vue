<script>
import { useAccountStore } from '../stores/accountStore'

export default {
  name: 'LogoutView',
  async mounted() {
    await useAccountStore().logout()
    this.$router.push('/')
  },
}
</script>

<template lang="pug">
p Logging out...
</template>
