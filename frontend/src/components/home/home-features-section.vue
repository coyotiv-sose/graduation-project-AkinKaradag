<script>
import { Truck, Gauge, Route, Sparkles, Shield, Leaf } from 'lucide-vue-next'
import HomeSectionHeader from './home-section-header.vue'

export default {
  name: 'HomeFeaturesSection',
  components: { Truck, Gauge, Route, Sparkles, Shield, Leaf, HomeSectionHeader },
}
</script>

<template lang="pug">
section#services.section
  HomeSectionHeader(
    eyebrow="Core infrastructure"
    title="Everything your dispatch team needs."
    body="A unified toolkit for customers, dispatchers and admins — from quote to delivery."
  )
  .features
    article.feature-card
      .feature-card__icon
        Truck(:size="20", :stroke-width="1.75")
      h3 Transport orders
      p Structured pickups and deliveries with billing info, cargo details and live status.
    article.feature-card
      .feature-card__icon
        Gauge(:size="20", :stroke-width="1.75")
      h3 Fleet & tours
      p Assign vehicles, plan tours and keep capacity visible across your whole company.
    article.feature-card.feature-card--accent
      .feature-card__icon
        Sparkles(:size="20", :stroke-width="1.75")
      h3 AI order capture
      p Describe a shipment in plain language and get a structured order ready to dispatch.
    article.feature-card
      .feature-card__icon
        Route(:size="20", :stroke-width="1.75")
      h3 Real-time updates
      p Socket-powered state changes so dispatchers and customers stay in sync.
    article.feature-card
      .feature-card__icon
        Shield(:size="20", :stroke-width="1.75")
      h3 Role-aware access
      p Admin, dispatcher and customer flows are separated with clean, enforced permissions.
    article.feature-card
      .feature-card__icon
        Leaf(:size="20", :stroke-width="1.75")
      h3 Built to scale
      p Multi-company by design. Ready to grow with your logistics operations.
</template>

<style scoped>
.section {
  padding: 3.5rem 0;
  border-top: 1px solid var(--color-border);
}

.features {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}

.feature-card {
  padding: 1.25rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  background: var(--color-background-card);
  transition: border-color var(--duration) var(--ease),
    box-shadow var(--duration) var(--ease),
    transform var(--duration) var(--ease);
}

.feature-card:hover {
  border-color: var(--color-border-hover);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.feature-card--accent {
  background:
    radial-gradient(circle at 100% 0%, var(--color-primary-soft), transparent 55%),
    var(--color-background-card);
  border-color: var(--color-primary-soft);
}

.feature-card__icon {
  width: 38px;
  height: 38px;
  border-radius: var(--radius-sm);
  background: var(--color-primary-soft);
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.85rem;
}

.feature-card h3 {
  margin: 0 0 0.35rem;
  font-size: 1rem;
}

.feature-card p {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin: 0;
  line-height: 1.55;
}

@media (max-width: 960px) {
  .features {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .features {
    grid-template-columns: 1fr;
  }
}
</style>
