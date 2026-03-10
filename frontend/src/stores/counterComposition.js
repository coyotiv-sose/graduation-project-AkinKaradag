import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCounterCompositionStore = defineStore('counterComposition', () => {
  const count = ref(0)
  const doubleCount = computed(() => count.value * 2)
  const increment = () => count.value++
  const decrement = () => count.value--

  return { count, doubleCount, increment, decrement }
})
