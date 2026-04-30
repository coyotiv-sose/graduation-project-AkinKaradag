<script>
export default {
  name: 'DispatcherDashboardFleetPanel',
  props: {
    companyId: { type: String, required: true },
    vehicles: { type: Array, default: () => [] },
  },
  methods: {
    vehicleName(vehicle) {
      return vehicle.name || `${vehicle.brand} ${vehicle.model}`
    },
    vehicleBadgeClass(state) {
      return {
        AVAILABLE: 'kl-badge kl-badge--primary',
        ON_TOUR: 'kl-badge kl-badge--info',
        IN_GARAGE: 'kl-badge kl-badge--danger',
        DAMAGED: 'kl-badge kl-badge--danger',
        PARKED: 'kl-badge kl-badge--muted',
        SOLD: 'kl-badge kl-badge--muted',
      }[state] || 'kl-badge kl-badge--muted'
    },
  },
}
</script>

<template lang="pug">
section.kl-card.kl-card--flush
  .kl-card-header
    div
      h3 Active fleet
      p.kl-muted.dispatch-panel__sub Vehicle states across your company
    router-link.kl-btn.kl-btn--ghost.kl-btn--sm(:to="`/companies/${companyId}/vehicles`") Manage
  ul.dispatch-panel__list.dispatch-panel__list--fleet
    li.vehicle-item(v-for="vehicle in vehicles" :key="vehicle._id")
      .vehicle-item__row
        .vehicle-item__head
          span.vehicle-item__name {{ vehicleName(vehicle) }}
          span.vehicle-item__meta {{ vehicle.brand }} {{ vehicle.model }} &middot; {{ vehicle.payLoad }} kg
        span(:class="vehicleBadgeClass(vehicle.state)") {{ vehicle.state }}
    li.dispatch-panel__empty(v-if="!vehicles.length") No vehicles registered.
</template>

<style scoped>
.dispatch-panel__list--fleet {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 0;
}

.vehicle-item {
  padding: 0.9rem 1.25rem;
  border-bottom: 1px solid var(--color-border);
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.vehicle-item:last-child {
  border-bottom: none;
  border-right: none;
}

.vehicle-item__row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
}

.vehicle-item__head {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  min-width: 0;
}

.vehicle-item__name {
  font-weight: 500;
  color: var(--color-heading);
}

.vehicle-item__meta {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
}
</style>