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
button.theme-toggle {
  position: relative;
  width: 54px;
  min-width: 28px;
  max-width: 100%;
  height: 28px;
  padding: 0;
  border: 1px solid var(--color-border);
  background: var(--color-background-hover);
  border-radius: var(--radius-pill);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  overflow: hidden;
  container-type: inline-size;
  transition:
    background-color var(--duration-fast) var(--ease),
    border-color var(--duration-fast) var(--ease);
  flex: 0 1 54px;
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
  transition:
    color var(--duration-fast) var(--ease),
    opacity var(--duration-fast) var(--ease);
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
  transition:
    left var(--duration) var(--ease),
    opacity var(--duration-fast) var(--ease);
}

.theme-toggle--dark .theme-toggle__thumb {
  left: calc(100% - 24px);
}

@container (max-width: 40px) {
  .theme-toggle__icon {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
  }

  .theme-toggle__icon--sun {
    opacity: 1;
  }

  .theme-toggle--dark .theme-toggle__icon--sun {
    opacity: 0;
  }

  .theme-toggle--dark .theme-toggle__icon--moon {
    opacity: 1;
  }

  .theme-toggle__thumb {
    opacity: 0;
  }
}
</style>
