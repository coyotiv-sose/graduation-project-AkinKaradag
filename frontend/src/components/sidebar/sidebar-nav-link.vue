<script>
import {
  LayoutDashboard,
  Home,
  Package,
  PlusCircle,
  Users,
  Truck,
  Building2,
  LogIn,
  ShieldCheck,
  BadgeInfo,
} from 'lucide-vue-next'

export default {
  name: 'SidebarNavLink',
  components: {
    LayoutDashboard,
    Home,
    Package,
    PlusCircle,
    Users,
    Truck,
    Building2,
    LogIn,
    ShieldCheck,
    BadgeInfo,
  },
  props: {
    to: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      required: true,
    },
    variant: {
      type: String,
      default: '',
    },
  },
  methods: {
    releaseFocus(event) {
      event.currentTarget?.blur()
    },
  },
}
</script>

<template lang="pug">
router-link.nav-item(
  :class="{ 'nav-item--sign-in': variant === 'sign-in' }"
  :to="to"
  :title="label"
  @click="releaseFocus"
)
  component.nav-icon(:is="icon", :size="20", :stroke-width="1.75")
  span.nav-label {{ label }}
</template>

<style scoped>
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
  transition:
    background-color var(--duration-fast) var(--ease),
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

.nav-item--sign-in {
  color: var(--color-primary);
}

.nav-icon {
  flex-shrink: 0;
}

.nav-label {
  opacity: 0;
  transform: translateX(-6px);
  transition:
    opacity var(--duration-fast) var(--ease),
    transform var(--duration-fast) var(--ease);
}
</style>
