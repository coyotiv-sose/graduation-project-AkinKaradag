<script setup>
import TheWelcome from '../components/TheWelcome.vue'
import Counter from '../components/Counter.vue'
import CounterOptionsApi from '@/components/CounterOptionsApi.vue'
import Counter2 from '@/components/Counter2.vue'
import Counter3 from '@/components/Counter3.vue'
</script>

<template>
  <main>
    <Counter name="Beer" />
    <CounterOptionsApi name="Wine" />
    <Counter2 name="Vodka" />
    <Counter3 name="Raki" />
    <Suspense>
      <TheWelcome />
    </Suspense>
  </main>
</template>
