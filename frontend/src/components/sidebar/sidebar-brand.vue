<script>
import { Pin, PinOff } from 'lucide-vue-next'

export default {
  name: 'SidebarBrand',
  components: { Pin, PinOff },
  props: {
    isPinned: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['toggle-pin'],
  computed: {
    pinButtonLabel() {
      return this.isPinned ? 'Unpin sidebar' : 'Pin sidebar'
    },
  },
  methods: {
    handleTogglePin() {
      this.$emit('toggle-pin')
    },
  },
}
</script>

<template lang="pug">
.brand
  router-link.brand-link(:to="'/'", :title="'RouteWerk'")
    span.brand-mark(aria-hidden="true") R
    span.brand-text RouteWerk
  button.pin-btn(
    type="button"
    :class="{ 'pin-btn--active': isPinned }"
    :aria-label="pinButtonLabel"
    :aria-pressed="isPinned ? 'true' : 'false'"
    :title="pinButtonLabel"
    @click="handleTogglePin"
  )
    PinOff(v-if="isPinned", :size="16", :stroke-width="1.75")
    Pin(v-else, :size="16", :stroke-width="1.75")
</template>

<style scoped>
.brand {
  position: relative;
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
  padding: 0.35rem 2.75rem 0.35rem 0.25rem;
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
  transition:
    opacity var(--duration-fast) var(--ease),
    transform var(--duration-fast) var(--ease);
}

.pin-btn {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  width: 32px;
  height: 32px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-background-card);
  color: var(--color-text-secondary);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  pointer-events: none;
  transform: translate(6px, -50%);
  transition:
    background-color var(--duration-fast) var(--ease),
    border-color var(--duration-fast) var(--ease),
    color var(--duration-fast) var(--ease),
    opacity var(--duration-fast) var(--ease),
    transform var(--duration-fast) var(--ease);
}

.pin-btn:hover,
.pin-btn--active {
  background: var(--color-background-hover);
  border-color: var(--color-border-hover);
  color: var(--color-heading);
}

.pin-btn:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
</style>
