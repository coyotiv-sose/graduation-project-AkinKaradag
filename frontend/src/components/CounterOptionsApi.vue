<script>
import { useCounterStore } from '@/stores/counter'
import { mapActions, mapState } from 'pinia'

export default {
  name: 'Counter',
  props: {
    name: {
      type: String,
      required: true,
    },
  },

  computed: {
    ...mapState(useCounterStore, ['count', 'doubleCount']),
  },

  methods: {
    ...mapActions(useCounterStore, ['increment', 'decrement']),
  },
}
</script>

<template lang="pug">
div
    h1 {{ name }}
    p Count: {{ count }}
    p DoubleCount: {{ doubleCount }}
    button(@click='increment') Increment
    button(@click='decrement') Decrement
</template>
