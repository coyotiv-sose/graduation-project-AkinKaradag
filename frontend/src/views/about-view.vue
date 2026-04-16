<script>
export default { name: 'AboutView' }
</script>

<template>
  <main class="about">
    <section class="hero">
      <span class="eyebrow">
        <span class="eyebrow__dot" />
        About
      </span>
      <h1>Logistics, engineered for clarity.</h1>
      <p>
        KaraLog is a transport management platform built for modern logistics operations.
        Dispatchers, customers and administrators share one consistent workspace &mdash; from order
        intake to final delivery.
      </p>
    </section>

    <section class="content">
      <article class="content-card">
        <h2>Our mission</h2>
        <p>
          Replace fragmented tools with a single, role-aware interface for transport orders, fleet
          management and tour planning.
        </p>
      </article>
      <article class="content-card">
        <h2>How we work</h2>
        <p>
          KaraLog stays fast and honest. Every feature is built to map to a real operational need
          &mdash; no decorative dashboards, no filler data.
        </p>
      </article>
    </section>
  </main>
</template>

<style scoped>
.about {
  max-width: 900px;
  margin: 0 auto;
  padding: 4rem 1.5rem;
}

.eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.3rem 0.7rem;
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
  background: var(--color-background-hover);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-pill);
  font-weight: 600;
}

.eyebrow__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-primary);
  box-shadow: 0 0 0 4px var(--color-primary-soft);
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

.content-card {
  padding: 1.5rem;
  background: var(--color-background-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
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
