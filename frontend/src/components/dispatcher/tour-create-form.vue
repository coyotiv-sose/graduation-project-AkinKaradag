<script>
import { vehicleName } from '@/utils/display-helpers'

export default {
  name: 'TourCreateForm',
  props: {
    availableVehicles: { type: Array, default: () => [] },
    vehicleId: { type: String, default: '' },
    date: { type: String, default: '' },
  },
  emits: ['update-vehicle-id', 'update-date', 'submit'],
  methods: {
    vehicleName,
  },
}
</script>

<template lang="pug">
.inline-form
  form.tour-form(@submit.prevent="$emit('submit')")
    .kl-field
      label.kl-label Vehicle
      select.kl-select(:value="vehicleId", required, @change="$emit('update-vehicle-id', $event.target.value)")
        option(value="", disabled) Select a vehicle
        option(v-for="vehicle in availableVehicles", :key="vehicle._id", :value="vehicle._id") {{ vehicleName(vehicle) }}
    .kl-field
      label.kl-label Date
      input.kl-input(:value="date", type="date", required, @input="$emit('update-date', $event.target.value)")
    button.kl-btn.kl-btn--primary(type="submit", :disabled="!vehicleId || !date") Create tour
  p.kl-muted.tour-form__hint(v-if="!availableVehicles.length") No available vehicles. Add or free up a vehicle to create a tour.
</template>

<style scoped>
.inline-form {
  padding: 1.25rem;
  background: var(--color-background-subtle);
  border-bottom: 1px solid var(--color-border);
}

.tour-form {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr)) auto;
  gap: 0.85rem;
  align-items: end;
}

.tour-form__hint {
  margin: 0.6rem 0 0;
  font-size: 0.8rem;
}

@media (max-width: 960px) {
  .tour-form {
    grid-template-columns: 1fr;
  }
}
</style>
