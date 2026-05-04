<script>
import { ArrowRight } from 'lucide-vue-next'

export default {
  name: 'HomeCta',
  components: { ArrowRight },
}
</script>

<template lang="pug">
section#contact.section
  .cta
    div
      h2 Ready to dispatch smarter?
      p.kl-muted Get in touch and we’ll set up your company account.
    a.kl-btn.kl-btn--primary.kl-btn--lg(href="mailto:akin@routewerk.com?subject=Account%20Request&body=Hello%2C%20I%20would%20like%20to%20request%20an%20account.")
      | Contact us
      ArrowRight(:size="16", :stroke-width="2")
</template>

<style scoped>
.section {
  padding: 3.5rem 0;
  border-top: 1px solid var(--color-border);
}

.cta {
  padding: 2rem;
  border-radius: var(--radius-lg);
  background:
    radial-gradient(circle at 20% 0%, var(--color-primary-soft), transparent 60%),
    var(--color-background-elevated);
  border: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.cta h2 {
  margin: 0;
  font-size: 1.5rem;
}

.cta p {
  margin: 0.35rem 0 0;
  font-size: 0.95rem;
}

@media (max-width: 640px) {
  .cta {
    align-items: flex-start;
  }
}
</style>
