<script>
import { vehicleName } from '@/utils/dispatcher-selectors'

const createEmptyTourForm = () => ({ date: '', vehicleId: '' })

export default {
  name: 'DispatcherTourCreateForm',
  props: {
    availableVehicles: { type: Array, default: () => [] },
    isSubmitting: { type: Boolean, default: false },
  },
  emits: ['submit', 'cancel'],
  data() {
    return { formData: createEmptyTourForm() }
  },
  computed: {
    canSubmit() {
      return !!this.formData.vehicleId && !!this.formData.date && !this.isSubmitting
    },
    hasAvailableVehicles() {
      return this.availableVehicles.length > 0
    },
  },
  methods: {
    vehicleName,
    onSubmit() {
      this.$emit('submit', { ...this.formData })
      this.formData = createEmptyTourForm()
    },
    onCancel() {
      this.formData = createEmptyTourForm()
      this.$emit('cancel')
    },
  },
}
</script>

<template lang="pug">
.inline-form
  form.tour-form(@submit.prevent="onSubmit")
    .kl-field
      label.kl-label Vehicle
      select.kl-select(v-model="formData.vehicleId", required)
        option(value="", disabled) Select a vehicle
        option(v-for="vehicle in availableVehicles", :key="vehicle._id", :value="vehicle._id")
          | {{ vehicleName(vehicle) }}
    .kl-field
      label.kl-label Date
      input.kl-input(v-model="formData.date", type="date", required)
    button.kl-btn.kl-btn--primary(type="submit", :disabled="!canSubmit") Create tour
    button.kl-btn.kl-btn--ghost(type="button", @click="onCancel") Cancel
  p.kl-muted.tour-form__hint(v-if="!hasAvailableVehicles")
    | No available vehicles. Add or free up a vehicle to create a tour.
</template>

<style scoped>
.tour-form {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr)) auto auto;
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
