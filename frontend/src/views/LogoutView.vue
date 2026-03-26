<script>
import axios from 'axios'

export default {
  name: 'LogoutView',
  async mounted() {
    await axios.delete('/accounts/session')
    this.$root.user = null
    this.$router.push('/')
  },
}
</script>

<template lang="pug">
p Logging out...
</template>
