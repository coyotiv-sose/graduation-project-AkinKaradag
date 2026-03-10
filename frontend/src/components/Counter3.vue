<script>
import { useCounterCompositionStore } from '@/stores/counterComposition'
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
    ...mapState(useCounterCompositionStore, ['count', 'doubleCount']),
  },

  methods: {
    ...mapActions(useCounterCompositionStore, ['increment', 'decrement']),
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
