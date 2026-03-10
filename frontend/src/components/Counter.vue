<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
import { useCounterStore } from '@/stores/counter'
import { ref } from 'vue'

defineProps({
  name: {
    type: String,
    required: true,
  },
})

const store = useCounterStore()
</script>

<template lang="pug">
div
    h1 {{ name }}
    p Count: {{ store.count }}
    p Double count is {{ store.doubleCount }}
    button(@click='store.increment()') Increment
    button(@click='store.decrement()') Decrement
</template>
