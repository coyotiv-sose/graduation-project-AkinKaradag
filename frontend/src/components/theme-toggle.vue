<script>
import { mapState, mapActions } from 'pinia'
import { useThemeStore } from '@/stores/theme-store'

export default {
  name: 'ThemeToggle',
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
  @click="toggleTheme"
  :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
  :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
)
  .toggle-track(:class="{ dark: isDark }")
    span.toggle-icon.sun 🌞
    span.toggle-icon.moon 🌙
    .toggle-thumb(:class="{ dark: isDark }")
</template>

<style scoped>
.theme-toggle {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
}

.toggle-track {
  position: relative;
  width: 52px;
  height: 28px;
  background: #e0e0e0;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 5px;
  transition: background-color 0.3s ease;
}

.toggle-track.dark {
  background: #3a3a5c;
}

.toggle-icon {
  font-size: 14px;
  line-height: 1;
  z-index: 1;
  user-select: none;
}

.toggle-thumb {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 22px;
  height: 22px;
  background: #ffffff;
  border-radius: 50%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease, background-color 0.3s ease;
}

.toggle-thumb.dark {
  transform: translateX(24px);
  background: #1e1e2e;
}
</style>
