import { defineStore } from 'pinia'

function applyTheme(value) {
  document.documentElement.setAttribute('data-theme', value)
  localStorage.setItem('theme', value)
}

const initialTheme = localStorage.getItem('theme') || 'light'
applyTheme(initialTheme)

export const useThemeStore = defineStore('Theme', {
  state: () => ({
    theme: initialTheme,
  }),
  getters: {
    isDark: (state) => state.theme === 'dark',
  },
  actions: {
    toggleTheme() {
      this.theme = this.theme === 'light' ? 'dark' : 'light'
      applyTheme(this.theme)
    },
  },
})
