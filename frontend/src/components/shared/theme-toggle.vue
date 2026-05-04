<script>
import { mapState, mapActions } from 'pinia'
import { useThemeStore } from '@/stores/theme-store'
import { Sun, Moon } from 'lucide-vue-next'

export default {
  name: 'ThemeToggle',
  components: { Sun, Moon },
  computed: {
    ...mapState(useThemeStore, ['isDark']),
  },
  methods: {
    ...mapActions(useThemeStore, ['toggleTheme']),
  },
}
</script>


<template lang="pug">
button.theme-toggle(
  type="button"
  :class="{ 'theme-toggle--dark': isDark }"
  :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
  :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
  @click="toggleTheme"
)
  span.theme-toggle__icon.theme-toggle__icon--sun
    Sun(:size="14", :stroke-width="2")
  span.theme-toggle__icon.theme-toggle__icon--moon
    Moon(:size="14", :stroke-width="2")
  span.theme-toggle__thumb
</template>

<style scoped>
.theme-toggle {
  position: relative;
  width: 54px;
  height: 28px;
  padding: 0;
  border: 1px solid var(--color-border);
  background: var(--color-background-hover);
  border-radius: var(--radius-pill);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  transition: background-color var(--duration-fast) var(--ease),
    border-color var(--duration-fast) var(--ease);
  flex-shrink: 0;
}

.theme-toggle:hover {
  border-color: var(--color-border-hover);
}

.theme-toggle__icon {
  position: relative;
  z-index: 2;
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
  transition: color var(--duration-fast) var(--ease);
}

.theme-toggle__icon--sun {
  color: var(--color-warning);
}

.theme-toggle--dark .theme-toggle__icon--sun {
  color: var(--color-text-muted);
}

.theme-toggle--dark .theme-toggle__icon--moon {
  color: var(--color-primary);
}

.theme-toggle__thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--color-background-card);
  box-shadow: var(--shadow-sm);
  transition: transform var(--duration) var(--ease);
}

.theme-toggle--dark .theme-toggle__thumb {
  transform: translateX(24px);
}
</style>
