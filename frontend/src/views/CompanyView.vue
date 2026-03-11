<script>
import company from '@/components/company.vue'
export default {
  components: { company },
}
</script>

<template>
  <main>
    <Suspense>
      <company />
    </Suspense>
  </main>
</template>
