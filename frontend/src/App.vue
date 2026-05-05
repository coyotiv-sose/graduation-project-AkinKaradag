<script>
import { mapState, mapActions } from 'pinia'
import { useAccountStore } from './stores/account-store'
import { useSocketStore } from './stores/socket-store'
import AppSidebar from './components/app-sidebar.vue'
import PublicTopNav from './components/public-top-nav.vue'

export default {
  name: 'App',
  components: { AppSidebar, PublicTopNav },
  computed: {
    ...mapState(useAccountStore, ['user']),
    isPublicLayout() {
      return this.$route.meta?.layout === 'public'
    },
  },
  methods: {
    ...mapActions(useAccountStore, ['fetchUser']),
    ...mapActions(useSocketStore, ['connect']),
  },
  async mounted() {
    await this.fetchUser()
  },
}
</script>


<template lang="pug">
  .app-shell(:class="[isPublicLayout ? 'app-shell--public' : 'app-shell--app']")
    template(v-if="isPublicLayout")
      PublicTopNav
      router-view
    template(v-else)
      AppSidebar
      main.app-main
        .app-main__inner
          router-view
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
  background: var(--color-background);
  color: var(--color-text);
}

.app-shell--app {
  padding-left: var(--sidebar-collapsed);
}

.app-main {
  min-height: 100vh;
}

.app-main__inner {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 2rem 3rem;
}

@media (max-width: 720px) {
  .app-main__inner {
    padding: 0 1rem 2rem;
  }
}
</style>
