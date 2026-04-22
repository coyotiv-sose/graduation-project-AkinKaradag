<script>
import { mapState, mapActions } from 'pinia'
import { useAccountStore } from '@/stores/account-store'
import ThemeToggle from './theme-toggle.vue'
import NotificationBell from './notification-bell.vue'
import {
  LayoutDashboard,
  Home,
  Package,
  PlusCircle,
  Users,
  Truck,
  Building2,
  LogIn,
  LogOut,
  ShieldCheck,
  BadgeInfo,
} from 'lucide-vue-next'

export default {
  name: 'AppSidebar',
  components: {
    ThemeToggle,
    NotificationBell,
    LayoutDashboard,
    Home,
    Package,
    PlusCircle,
    Users,
    Truck,
    Building2,
    LogIn,
    LogOut,
    ShieldCheck,
    BadgeInfo,
  },
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
      const src = this.displayName || '?'
      return src
        .split(/[\s@]+/)
        .filter(Boolean)
        .slice(0, 2)
        .map(p => p[0]?.toUpperCase() || '')
        .join('')
    },
    navItems() {
      const items = [{ to: '/', label: 'Home', icon: 'Home' }]
      if (!this.user) {
        items.push({ to: '/login', label: 'Sign in', icon: 'LogIn' })
        return items
      }
      if (this.isCustomer) {
        items.push(
          { to: '/orders/new', label: 'New order', icon: 'PlusCircle' },
          { to: '/orders', label: 'My orders', icon: 'Package' },
        )
      }
      if (this.isEmployee && this.companyId) {
        items.push(
          { to: `/companies/${this.companyId}/dispatcher`, label: 'Dispatcher', icon: 'LayoutDashboard' },
          { to: '/orders/new', label: 'New order', icon: 'PlusCircle' },
          { to: `/companies/${this.companyId}/orders`, label: 'Orders', icon: 'Package' },
          { to: `/companies/${this.companyId}/vehicles`, label: 'Vehicles', icon: 'Truck' },
          { to: `/companies/${this.companyId}`, label: 'Company', icon: 'Building2' },
        )
      }
      if (this.isAdmin) {
        items.push(
          { to: '/admin', label: 'Admin', icon: 'ShieldCheck' },
          { to: '/orders/new', label: 'New order', icon: 'PlusCircle' },
          { to: '/companies', label: 'Companies', icon: 'Building2' },
        )
      }
      return items
    },
  },
  methods: {
    ...mapActions(useAccountStore, ['logout']),
    async handleLogout() {
      await this.logout()
      this.$router.push('/')
    },
  },
}
</script>


<template lang="pug">
aside.app-sidebar(aria-label="Primary navigation")
  .brand
    router-link.brand-link(:to="'/'", :title="'RouteWerk'")
      span.brand-mark(aria-hidden="true") K
      span.brand-text RouteWerk

  nav.nav
    router-link.nav-item(
      v-for="item in navItems"
      :key="item.to + item.label"
      :to="item.to"
      :title="item.label"
    )
      component.nav-icon(:is="item.icon", :size="20", :stroke-width="1.75")
      span.nav-label {{ item.label }}

  .footer
    .footer-controls
      NotificationBell(v-if="user")
      ThemeToggle

    .user-card(v-if="user")
      .user-avatar {{ initials }}
      .user-meta
        .user-name(:title="displayName") {{ displayName }}
        .user-role {{ displayRole }}
      button.logout-btn(
        type="button"
        title="Sign out"
        aria-label="Sign out"
        @click="handleLogout"
      )
        LogOut(:size="16", :stroke-width="1.75")
    router-link.nav-item.sign-in(v-else, to="/login", title="Sign in")
      LogIn.nav-icon(:size="20", :stroke-width="1.75")
      span.nav-label Sign in
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
  transition: width var(--duration) var(--ease),
    box-shadow var(--duration) var(--ease),
    background-color var(--duration) var(--ease);
}

.app-sidebar:hover,
.app-sidebar:focus-within {
  width: var(--sidebar-expanded);
  box-shadow: var(--shadow-lg);
}

/* Brand */
.brand {
  padding: 1rem 0.75rem;
  border-bottom: 1px solid var(--color-border);
  min-height: var(--header-height);
  display: flex;
  align-items: center;
}

.brand-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.35rem 0.25rem;
  color: var(--color-heading);
  text-decoration: none;
  width: 100%;
}

.brand-mark {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: var(--color-primary);
  color: var(--color-primary-contrast);
  font-weight: 700;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 0 0 2px var(--color-primary-soft);
}

.brand-text {
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: -0.01em;
  white-space: nowrap;
  opacity: 0;
  transform: translateX(-6px);
  transition: opacity var(--duration-fast) var(--ease),
    transform var(--duration-fast) var(--ease);
}

/* Nav */
.nav {
  flex: 1;
  padding: 0.75rem 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  overflow-y: auto;
  overflow-x: hidden;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.55rem 0.65rem;
  border-radius: var(--radius-sm);
  color: var(--color-text-secondary);
  font-size: 0.875rem;
  font-weight: 500;
  text-decoration: none;
  white-space: nowrap;
  transition: background-color var(--duration-fast) var(--ease),
    color var(--duration-fast) var(--ease);
  position: relative;
}

.nav-item:hover {
  background: var(--color-background-hover);
  color: var(--color-text);
}

.nav-item.router-link-exact-active {
  background: var(--color-primary-soft);
  color: var(--color-primary);
}

.nav-item.router-link-exact-active::before {
  content: '';
  position: absolute;
  left: -0.5rem;
  top: 0.4rem;
  bottom: 0.4rem;
  width: 3px;
  border-radius: 0 3px 3px 0;
  background: var(--color-primary);
}

.nav-icon {
  flex-shrink: 0;
}

.nav-label {
  opacity: 0;
  transform: translateX(-6px);
  transition: opacity var(--duration-fast) var(--ease),
    transform var(--duration-fast) var(--ease);
}

/* Footer */
.footer {
  padding: 0.75rem 0.5rem 1rem;
  border-top: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.footer-controls {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  justify-content: flex-start;
  padding: 0 0.25rem;
}

.user-card {
  display: grid;
  grid-template-columns: 32px 1fr auto;
  align-items: center;
  gap: 0.55rem;
  padding: 0.4rem 0.45rem;
  border-radius: var(--radius-sm);
  background: var(--color-background-hover);
  color: var(--color-text);
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--color-primary);
  color: var(--color-primary-contrast);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  flex-shrink: 0;
}

.user-meta {
  min-width: 0;
  opacity: 0;
  transform: translateX(-6px);
  transition: opacity var(--duration-fast) var(--ease),
    transform var(--duration-fast) var(--ease);
}

.user-name {
  font-size: 0.85rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--color-heading);
}

.user-role {
  font-size: 0.7rem;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.logout-btn {
  width: 28px;
  height: 28px;
  border-radius: var(--radius-sm);
  border: none;
  background: transparent;
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transition: background-color var(--duration-fast) var(--ease),
    color var(--duration-fast) var(--ease),
    opacity var(--duration-fast) var(--ease);
}

.logout-btn:hover {
  background: var(--color-danger-soft);
  color: var(--color-danger);
}

.sign-in {
  color: var(--color-primary);
}

/* Reveal labels when expanded */
.app-sidebar:hover .brand-text,
.app-sidebar:focus-within .brand-text,
.app-sidebar:hover .nav-label,
.app-sidebar:focus-within .nav-label,
.app-sidebar:hover .user-meta,
.app-sidebar:focus-within .user-meta {
  opacity: 1;
  transform: translateX(0);
}

.app-sidebar:hover .logout-btn,
.app-sidebar:focus-within .logout-btn {
  opacity: 1;
}

/* Prevent the footer controls from overflowing when collapsed */
:deep(.notification-bell),
:deep(.theme-toggle) {
  flex-shrink: 0;
}
</style>
