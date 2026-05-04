<script>
export default {
  name: 'OrderDetailCargoCard',
  props: {
    cargos: {
      type: Array,
      default: () => [],
    },
  },
}
</script>

<template lang="pug">
section.kl-card.kl-card--flush
  .kl-card-header
    h3 Cargo ({{ cargos.length }})
  .cargo-list
    div.cargo-card(v-for="(cargo, idx) in cargos" :key="idx")
      .cargo-card__head
        span.cargo-card__title {{ cargo.quantity }}x {{ cargo.loadCarrierType }}
        span.cargo-card__weight {{ cargo.weight }} kg
      .cargo-card__meta
        | Dimensions: {{ cargo.dimensions.width }} × {{ cargo.dimensions.length }} × {{ cargo.dimensions.height }} cm
</template>

<style scoped>
.cargo-list {
  display: grid;
  gap: 0;
}

.cargo-card {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.cargo-card:last-child {
  border-bottom: none;
}

.cargo-card__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.cargo-card__title {
  font-weight: 600;
  color: var(--color-heading);
}

.cargo-card__weight {
  color: var(--color-text-secondary);
  font-size: 0.875rem;
}

.cargo-card__meta {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
}
</style>
