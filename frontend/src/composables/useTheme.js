import { ref, watchEffect } from 'vue'

const theme = ref(localStorage.getItem('theme') || 'light')

function applyTheme(value) {
  document.documentElement.setAttribute('data-theme', value)
  localStorage.setItem('theme', value)
}

applyTheme(theme.value)

watchEffect(() => {
  applyTheme(theme.value)
})

export function useTheme() {
  function toggleTheme() {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
  }

  return { theme, toggleTheme }
}
