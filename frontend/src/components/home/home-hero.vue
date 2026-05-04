<script>
import { ArrowRight } from 'lucide-vue-next'
import HomeHeroPreview from './home-hero-preview.vue'

export default {
  name: 'HomeHero',
  components: { ArrowRight, HomeHeroPreview },
  props: {
    mainButton: { type: Object, required: true },
    showAccountRequest: { type: Boolean, default: false },
  },
}
</script>

<template lang="pug">
section.hero
  .hero__inner
    .hero__copy
      span.eyebrow
        span.eyebrow__dot
        | Logistics control plane
      h1.hero__title
        | Move cargo with
        span.accent  precision.
      p.hero__subtitle
        | RouteWerk orchestrates transport orders, fleets and dispatching for modern logistics companies — end to end, in one place.
      .hero__actions
        router-link.kl-btn.kl-btn--primary.kl-btn--lg(:to="mainButton.to")
          | {{ mainButton.label }}
          ArrowRight(:size="16", :stroke-width="2")
        a.kl-btn.kl-btn--outline.kl-btn--lg(
          v-if="showAccountRequest"
          href="mailto:akin@routewerk.com?subject=Account%20Request&body=Hello%2C%20I%20would%20like%20to%20request%20an%20account."
        ) Request an account
      .hero__metrics
        .metric
          .metric__value 24/7
          .metric__label Live dispatching
        .metric
          .metric__value AI
          .metric__label Order capture
        .metric
          .metric__value 100%
          .metric__label Role-aware access
    HomeHeroPreview
</template>

<style scoped>
.hero {
  padding: 4rem 0 3rem;
}

.hero__inner {
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr);
  gap: 3rem;
  align-items: center;
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

.hero__title {
  margin-top: 1.25rem;
  font-size: clamp(2.4rem, 5vw, 3.75rem);
  line-height: 1.05;
  letter-spacing: -0.03em;
  font-weight: 700;
}

.hero__title .accent {
  color: var(--color-primary);
}

.hero__subtitle {
  margin-top: 1.1rem;
  font-size: 1.05rem;
  color: var(--color-text-secondary);
  max-width: 520px;
  line-height: 1.6;
}

.hero__actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1.75rem;
  flex-wrap: wrap;
}

.hero__metrics {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
  margin-top: 2.5rem;
  max-width: 520px;
}

.metric {
  padding: 0.85rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  background: var(--color-background-card);
}

.metric__value {
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--color-heading);
  letter-spacing: -0.01em;
}

.metric__label {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-top: 0.25rem;
}

@media (max-width: 960px) {
  .hero__inner {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .hero {
    padding: 2.5rem 0 1.5rem;
  }

  .hero__metrics {
    grid-template-columns: 1fr;
  }
}
</style>
