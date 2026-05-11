<script>
import SidebarNavLink from './sidebar-nav-link.vue'

export default {
  name: 'SidebarNav',
  components: { SidebarNavLink },
  props: {
    items: {
      type: Array,
      required: true,
    },
  },
}
</script>

<template lang="pug">
nav.nav
  SidebarNavLink(
    v-for="item in items"
    :key="item.to + item.label"
    :to="item.to"
    :label="item.label"
    :icon="item.icon"
  )
</template>

<style scoped>
.nav {
  flex: 1;
  padding: 0.75rem 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  overflow-y: auto;
  overflow-x: hidden;
}
</style>
