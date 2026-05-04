<script>
import TourCard from './tour-card.vue'

export default {
  name: 'TourListSection',
  components: { TourCard },
  props: {
    title: { type: String, required: true },
    tours: { type: Array, default: () => [] },
    variant: {
      type: String,
      required: true,
      validator: value => ['planned', 'active', 'archived'].includes(value),
    },
    dragOverTourId: { type: [String, Number], default: null },
    availableVehicles: { type: Array, default: () => [] },
  },
  emits: [
    'open-assign-order',
    'assign-vehicle',
    'update-tour-state',
    'cancel-tour',
    'tour-drag-over',
    'tour-drag-leave',
    'tour-drop',
  ],
  methods: {
    openAssignOrder(tourId) {
      this.$emit('open-assign-order', tourId)
    },
    assignVehicle(tourId, vehicleId) {
      this.$emit('assign-vehicle', tourId, vehicleId)
    },
    updateTourState(tourId, state) {
      this.$emit('update-tour-state', tourId, state)
    },
    cancelTour(tourId) {
      this.$emit('cancel-tour', tourId)
    },
    tourDragOver(event, tourId) {
      this.$emit('tour-drag-over', event, tourId)
    },
    tourDragLeave(tourId) {
      this.$emit('tour-drag-leave', tourId)
    },
    tourDrop(event, tourId) {
      this.$emit('tour-drop', event, tourId)
    },
  },
}
</script>

<template lang="pug">
template(v-if="tours.length")
  .panel__subheader {{ title }}
  ul.panel__list.panel__list--tours
    TourCard(
      v-for="tour in tours",
      :key="tour._id",
      :tour="tour",
      :variant="variant",
      :drag-over="dragOverTourId === tour._id",
      :available-vehicles="availableVehicles",
      @open-assign-order="openAssignOrder",
      @assign-vehicle="assignVehicle",
      @update-tour-state="updateTourState",
      @cancel-tour="cancelTour",
      @drag-over="tourDragOver",
      @drag-leave="tourDragLeave",
      @drop="tourDrop"
    )
</template>

<style scoped src="./dispatcher-shared.css"></style>
