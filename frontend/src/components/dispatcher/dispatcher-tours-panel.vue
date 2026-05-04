<script>
import { Plus } from 'lucide-vue-next'
import TourCreateForm from './tour-create-form.vue'
import TourListSection from './tour-list-section.vue'

export default {
  name: 'DispatcherToursPanel',
  components: { Plus, TourCreateForm, TourListSection },
  props: {
    showTourForm: { type: Boolean, default: false },
    tourForm: { type: Object, required: true },
    availableVehicles: { type: Array, default: () => [] },
    plannedTours: { type: Array, default: () => [] },
    startedTours: { type: Array, default: () => [] },
    archivedTours: { type: Array, default: () => [] },
    tours: { type: Array, default: () => [] },
    dragOverTourId: { type: [String, Number], default: null },
  },
  emits: [
    'toggle-tour-form',
    'update-tour-vehicle',
    'update-tour-date',
    'create-tour',
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
section.kl-card.kl-card--flush.panel
  .kl-card-header
    div
      h3 Tours
      p.kl-muted.panel__sub Plan, assign and start delivery tours
    button.kl-btn.kl-btn--primary.kl-btn--sm(type="button", @click="$emit('toggle-tour-form')")
      Plus(:size="14", :stroke-width="2")
      | {{ showTourForm ? 'Cancel' : 'New tour' }}

  TourCreateForm(
    v-if="showTourForm",
    :available-vehicles="availableVehicles",
    :vehicle-id="tourForm.vehicleId",
    :date="tourForm.date",
    @update-vehicle-id="$emit('update-tour-vehicle', $event)",
    @update-date="$emit('update-tour-date', $event)",
    @submit="$emit('create-tour')"
  )

  TourListSection(
    title="Planned",
    variant="planned",
    :tours="plannedTours",
    :drag-over-tour-id="dragOverTourId",
    :available-vehicles="availableVehicles",
    @open-assign-order="openAssignOrder",
    @assign-vehicle="assignVehicle",
    @update-tour-state="updateTourState",
    @cancel-tour="cancelTour",
    @tour-drag-over="tourDragOver",
    @tour-drag-leave="tourDragLeave",
    @tour-drop="tourDrop"
  )

  TourListSection(
    title="Active",
    variant="active",
    :tours="startedTours",
    @update-tour-state="updateTourState",
    @cancel-tour="cancelTour"
  )

  TourListSection(
    title="History",
    variant="archived",
    :tours="archivedTours"
  )

  .panel__empty.panel__empty--big(v-if="!tours.length") No tours yet.
</template>

<style scoped src="./dispatcher-shared.css"></style>
