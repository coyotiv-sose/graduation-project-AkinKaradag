<script>
import { LogOut } from 'lucide-vue-next'
import NotificationBell from '../notification-bell.vue'
import ThemeToggle from '../theme-toggle.vue'
import SidebarNavLink from './sidebar-nav-link.vue'

export default {
  name: 'SidebarFooter',
  components: {
    LogOut,
    NotificationBell,
    ThemeToggle,
    SidebarNavLink,
  },
  props: {
    user: {
      type: Object,
      default: null,
    },
    initials: {
      type: String,
      required: true,
    },
    displayName: {
      type: String,
      required: true,
    },
    displayRole: {
      type: String,
      required: true,
    },
  },
  emits: ['logout'],
  methods: {
    handleLogout() {
      this.$emit('logout')
    },
  },
}
</script>

<template lang="pug">
.footer
  .footer-controls
    NotificationBell(v-if="user")
    ThemeToggle.sidebar-theme-toggle

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
  SidebarNavLink(v-else, to="/login", label="Sign in", icon="LogIn", variant="sign-in")
</template>

<style scoped>
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

.footer-controls > :deep(.sidebar-theme-toggle) {
  flex: 0 0 0;
  width: 0;
  min-width: 0;
  border-width: 0;
  opacity: 0;
  pointer-events: none;
  transform: translateX(-4px);
  visibility: hidden;
  transition:
    width var(--duration-fast) var(--ease),
    flex-basis var(--duration-fast) var(--ease),
    opacity var(--duration-fast) var(--ease),
    transform var(--duration-fast) var(--ease),
    visibility 0s linear var(--duration-fast);
}

.footer-controls > :deep(.notification-bell) {
  flex-shrink: 0;
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
  transition:
    opacity var(--duration-fast) var(--ease),
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
  transition:
    background-color var(--duration-fast) var(--ease),
    color var(--duration-fast) var(--ease),
    opacity var(--duration-fast) var(--ease);
}

.logout-btn:hover {
  background: var(--color-danger-soft);
  color: var(--color-danger);
}
</style>
