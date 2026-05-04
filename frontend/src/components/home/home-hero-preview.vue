<script>
export default {
  name: 'HomeHeroPreview',
}
</script>

<template lang="pug">
.hero__panel(aria-hidden="true")
  .panel-grid
    .panel-card
      .panel-card__head
        span.kl-badge.kl-badge--primary On route
        span.panel-card__id #ORD-8812
      .panel-card__title Basel &rarr; Zurich
      .panel-card__meta Capacity
      .kl-progress
        .kl-progress__fill(style="--value: 76%")
    .panel-card
      .panel-card__head
        span.kl-badge.kl-badge--warning Pending
        span.panel-card__id #ORD-9921
      .panel-card__title Aarau &rarr; Bern
      .panel-card__meta 2 pallets &middot; 420 kg
    .panel-card.panel-card--wide
      .panel-card__head
        span.kl-badge.kl-badge--info Active fleet
      .fleet-row
        .fleet-dot
        span KN-8821
        span.kl-muted 82% cap
      .fleet-row
        .fleet-dot.fleet-dot--warn
        span KN-4402
        span.kl-muted delayed
      .fleet-row
        .fleet-dot.fleet-dot--muted
        span KN-9011
        span.kl-muted idle
</template>

<style scoped>
.hero__panel {
  position: relative;
  padding: 1.5rem;
  border-radius: var(--radius-lg);
  background:
    radial-gradient(circle at 10% 0%, var(--color-primary-soft), transparent 50%),
    var(--color-background-elevated);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-lg);
}

.panel-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.85rem;
}

.panel-card {
  padding: 0.85rem 1rem;
  background: var(--color-background-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.panel-card--wide {
  grid-column: 1 / -1;
  gap: 0.5rem;
}

.panel-card__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.panel-card__id {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

.panel-card__title {
  font-weight: 600;
  color: var(--color-heading);
}

.panel-card__meta {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

.fleet-row {
  display: grid;
  grid-template-columns: 10px 1fr auto;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.85rem;
  padding: 0.3rem 0;
}

.fleet-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-soft);
}

.fleet-dot--warn {
  background: var(--color-warning);
  box-shadow: 0 0 0 3px var(--color-warning-soft);
}

.fleet-dot--muted {
  background: var(--color-text-muted);
  box-shadow: none;
}

@media (max-width: 640px) {
  .panel-grid {
    grid-template-columns: 1fr;
  }
}
</style>
