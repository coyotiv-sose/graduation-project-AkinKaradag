<script>
import Company from '@/components/company.vue'
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
