<script>
import Customer from '@/components/Customer.vue'
export default {
  components: { Customer },
}
</script>

<template>
  <main>
    <Suspense>
      <Customer />
    </Suspense>
  </main>
</template>
