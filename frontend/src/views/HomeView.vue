<script setup>
import TheWelcome from '../components/TheWelcome.vue'
import Counter from '../components/Counter.vue'
import CounterOptionsApi from '@/components/CounterOptionsApi.vue'
</script>

<template>
  <main>
    <Counter name="Beer" />
    <CounterOptionsApi name="Wine" />
    <Suspense>
      <TheWelcome />
    </Suspense>
  </main>
</template>
