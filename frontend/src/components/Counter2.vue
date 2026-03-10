<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
import { useCounterCompositionStore } from '@/stores/counterComposition'

defineProps({
  name: {
    type: String,
    required: true,
  },
})

const store = useCounterCompositionStore()
</script>

<template lang="pug">
div
    h1 {{ name }}
    p Count: {{ store.count }}
    p Double count is {{ store.doubleCount }}
    button(@click='store.increment()') Increment
    button(@click='store.decrement()') Decrement
</template>
