<script>
import CreateCompanyForm from '@/components/CreateCompanyForm.vue'
export default {
  components: { CreateCompanyForm },
}
</script>

<template>
  <main>
    <Suspense>
      <CreateCompanyForm />
    </Suspense>
  </main>
</template>
