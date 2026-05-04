<script>
import { Package, Route, Truck } from 'lucide-vue-next'

export default {
  name: 'DispatcherKpiRow',
  components: { Package, Route, Truck },
  props: {
    pendingCount: { type: Number, required: true },
    activeToursCount: { type: Number, required: true },
    plannedToursCount: { type: Number, required: true },
    availableVehiclesCount: { type: Number, required: true },
    vehicleCount: { type: Number, required: true },
  },
}
</script>

<template lang="pug">
section.kpi-row
  .kpi
    .kpi__icon
      Package(:size="18", :stroke-width="1.75")
    div
      .kpi__label Pending orders
      .kpi__value {{ pendingCount }}
  .kpi
    .kpi__icon.kpi__icon--info
      Route(:size="18", :stroke-width="1.75")
    div
      .kpi__label Active tours
      .kpi__value {{ activeToursCount }}
  .kpi
    .kpi__icon.kpi__icon--warn
      Route(:size="18", :stroke-width="1.75")
    div
      .kpi__label Planned tours
      .kpi__value {{ plannedToursCount }}
  .kpi
    .kpi__icon.kpi__icon--info
      Truck(:size="18", :stroke-width="1.75")
    div
      .kpi__label Available fleet
      .kpi__value {{ availableVehiclesCount }} / {{ vehicleCount }}
</template>

<style scoped>
.kpi-row {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.85rem;
}

.kpi {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 1rem 1.15rem;
  background: var(--color-background-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
}

.kpi__icon {
  width: 38px;
  height: 38px;
  border-radius: var(--radius-sm);
  background: var(--color-primary-soft);
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
}
.kpi__icon--info  { background: var(--color-info-soft);    color: var(--color-info); }
.kpi__icon--warn  { background: var(--color-warning-soft); color: var(--color-warning); }

.kpi__label {
  font-size: 0.72rem;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
}

.kpi__value {
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--color-heading);
  letter-spacing: -0.01em;
  margin-top: 0.1rem;
}

@media (max-width: 960px) {
  .kpi-row {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
