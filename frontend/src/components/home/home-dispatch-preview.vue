<script>
export default {
  name: 'HomeDispatchPreview',
}
</script>

<template lang="pug">
.dispatch-preview(aria-hidden="true")
  .dispatch-preview__grid
    .dispatch-preview__card
      .dispatch-preview__head
        span.kl-badge.kl-badge--primary On route
        span.dispatch-preview__id #ORD-8812
      .dispatch-preview__title Basel → Zurich
      .dispatch-preview__meta Capacity
      .kl-progress
        .kl-progress__fill(style="--value: 76%")
    .dispatch-preview__card
      .dispatch-preview__head
        span.kl-badge.kl-badge--warning Pending
        span.dispatch-preview__id #ORD-9921
      .dispatch-preview__title Aarau → Bern
      .dispatch-preview__meta 2 pallets · 420 kg
    .dispatch-preview__card.dispatch-preview__card--wide
      .dispatch-preview__head
        span.kl-badge.kl-badge--info Active fleet
      .dispatch-preview__fleet-row
        .dispatch-preview__fleet-dot
        span KN-8821
        span.kl-muted 82% cap
      .dispatch-preview__fleet-row
        .dispatch-preview__fleet-dot.dispatch-preview__fleet-dot--warn
        span KN-4402
        span.kl-muted delayed
      .dispatch-preview__fleet-row
        .dispatch-preview__fleet-dot.dispatch-preview__fleet-dot--muted
        span KN-9011
        span.kl-muted idle
</template>

<style scoped>
.dispatch-preview {
  position: relative;
  padding: 1.5rem;
  border-radius: var(--radius-lg);
  background:
    radial-gradient(circle at 10% 0%, var(--color-primary-soft), transparent 50%),
    var(--color-background-elevated);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-lg);
}

.dispatch-preview__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.85rem;
}

.dispatch-preview__card {
  padding: 0.85rem 1rem;
  background: var(--color-background-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.dispatch-preview__card--wide {
  grid-column: 1 / -1;
  gap: 0.5rem;
}

.dispatch-preview__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dispatch-preview__id {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

.dispatch-preview__title {
  font-weight: 600;
  color: var(--color-heading);
}

.dispatch-preview__meta {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

.dispatch-preview__fleet-row {
  display: grid;
  grid-template-columns: 10px 1fr auto;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.85rem;
  padding: 0.3rem 0;
}

.dispatch-preview__fleet-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-soft);
}

.dispatch-preview__fleet-dot--warn {
  background: var(--color-warning);
  box-shadow: 0 0 0 3px var(--color-warning-soft);
}

.dispatch-preview__fleet-dot--muted {
  background: var(--color-text-muted);
  box-shadow: none;
}

@media (max-width: 640px) {
  .dispatch-preview__grid {
    grid-template-columns: 1fr;
  }
}
</style>
