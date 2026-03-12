<script>
import Company from '@/components/Company.vue'
export default {
  components: { Company },
}
</script>

<template>
  <main>
    <Suspense>
      <Company />
    </Suspense>
  </main>
</template>
