<script>
import { mapState, mapActions } from 'pinia'
import { useAccountStore } from '@/stores/account-store'
import { initials as getInitials } from '@/utils/display-helpers'
import SidebarBrand from './sidebar/sidebar-brand.vue'
import SidebarFooter from './sidebar/sidebar-footer.vue'
import SidebarNav from './sidebar/sidebar-nav.vue'
import { buildSidebarNavItems } from './sidebar/sidebar-nav-items'

export default {
  name: 'AppSidebar',
  components: {
    SidebarBrand,
    SidebarFooter,
    SidebarNav,
  },
  props: {
    isPinned: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['pin-change'],
  computed: {
    ...mapState(useAccountStore, [
      'user',
      'profile',
      'isCustomer',
      'isEmployee',
      'isAdmin',
      'companyId',
    ]),
    displayName() {
      if (this.profile?.customerName) return this.profile.customerName
      if (this.profile?.name) return this.profile.name
      return this.user?.email || 'Account'
    },
    displayRole() {
      if (this.isAdmin) return 'Administrator'
      if (this.isEmployee) return 'Dispatcher'
      if (this.isCustomer) return 'Customer'
      return 'Guest'
    },
    initials() {
      return getInitials(this.displayName)
    },
    navItems() {
      return buildSidebarNavItems({
        user: this.user,
        isCustomer: this.isCustomer,
        isEmployee: this.isEmployee,
        isAdmin: this.isAdmin,
        companyId: this.companyId,
      })
    },
  },
  methods: {
    ...mapActions(useAccountStore, ['logout']),
    togglePinned() {
      this.$emit('pin-change', !this.isPinned)
    },
    async handleLogout() {
      await this.logout()
      this.$router.push('/')
    },
  },
}
</script>

<template lang="pug">
aside.app-sidebar(:class="{ 'app-sidebar--pinned': isPinned }", aria-label="Primary navigation")
  SidebarBrand(:is-pinned="isPinned", @toggle-pin="togglePinned")
  SidebarNav(:items="navItems")
  SidebarFooter(
    :user="user"
    :initials="initials"
    :display-name="displayName"
    :display-role="displayRole"
    @logout="handleLogout"
  )
</template>

<style scoped>
.app-sidebar {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: var(--sidebar-collapsed);
  background: var(--color-background-card);
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 100;
  transition:
    width var(--duration) var(--ease),
    box-shadow var(--duration) var(--ease),
    background-color var(--duration) var(--ease);
}

.app-sidebar:hover,
.app-sidebar:focus-within,
.app-sidebar--pinned {
  width: var(--sidebar-expanded);
  box-shadow: var(--shadow-lg);
}

.app-sidebar:hover :deep(.brand-text),
.app-sidebar:focus-within :deep(.brand-text),
.app-sidebar--pinned :deep(.brand-text),
.app-sidebar:hover :deep(.nav-label),
.app-sidebar:focus-within :deep(.nav-label),
.app-sidebar--pinned :deep(.nav-label),
.app-sidebar:hover :deep(.user-meta),
.app-sidebar:focus-within :deep(.user-meta),
.app-sidebar--pinned :deep(.user-meta) {
  opacity: 1;
  transform: translateX(0);
}

.app-sidebar:hover :deep(.logout-btn),
.app-sidebar:focus-within :deep(.logout-btn),
.app-sidebar--pinned :deep(.logout-btn) {
  opacity: 1;
}

.app-sidebar:hover :deep(.pin-btn),
.app-sidebar:focus-within :deep(.pin-btn),
.app-sidebar--pinned :deep(.pin-btn) {
  opacity: 1;
  pointer-events: auto;
  transform: translate(0, -50%);
}

.app-sidebar:hover :deep(.sidebar-theme-toggle),
.app-sidebar:focus-within :deep(.sidebar-theme-toggle),
.app-sidebar--pinned :deep(.sidebar-theme-toggle) {
  flex-basis: 54px;
  width: 54px;
  min-width: 28px;
  border-width: 1px;
  opacity: 1;
  pointer-events: auto;
  transform: translateX(0);
  visibility: visible;
  transition-delay: 0s;
}
</style>
