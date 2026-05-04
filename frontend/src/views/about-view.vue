<script>
export default { name: 'AboutView' }
</script>


<template lang="pug">
main.about.kl-public-page
  section.hero
    span.kl-eyebrow
      span.kl-eyebrow__dot
      | About
    h1 Logistics, engineered for clarity.
    p
      | RouteWerk is a transport management platform built for modern logistics operations.
      | Dispatchers, customers and administrators share one consistent workspace — from order
      | intake to final delivery.
  section.content
    article.content-card.kl-card.kl-card--padded
      h2 Our mission
      p
        | Replace fragmented tools with a single, role-aware interface for transport orders, fleet
        | management and tour planning.
    article.content-card.kl-card.kl-card--padded
      h2 How we work
      p
        | RouteWerk stays fast and honest. Every feature is built to map to a real operational need
        | — no decorative dashboards, no filler data.
</template>

<style scoped>
.about {
  max-width: 900px;
  padding-top: 4rem;
}

.hero h1 {
  margin-top: 1rem;
  font-size: clamp(2rem, 4vw, 2.75rem);
  letter-spacing: -0.02em;
}

.hero p {
  margin-top: 1rem;
  color: var(--color-text-secondary);
  font-size: 1.05rem;
  max-width: 640px;
  line-height: 1.6;
}

.content {
  margin-top: 3rem;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.content-card h2 {
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
}

.content-card p {
  color: var(--color-text-secondary);
  font-size: 0.95rem;
  line-height: 1.55;
  margin: 0;
}

@media (max-width: 640px) {
  .content {
    grid-template-columns: 1fr;
  }
}
</style>
