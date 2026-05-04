<script>
import { Plus } from 'lucide-vue-next'
import DispatcherTourCreateForm from '@/components/dispatcher-tour-create-form.vue'
import DispatcherTourCard from '@/components/dispatcher-tour-card.vue'
import DispatcherTourAssignModal from '@/components/dispatcher-tour-assign-modal.vue'
import { availableVehicles, pendingOrders } from '@/utils/dispatcher-selectors'

export default {
  name: 'DispatcherDashboardToursPanel',
  components: { Plus, DispatcherTourCreateForm, DispatcherTourCard, DispatcherTourAssignModal },
  props: {
    orders: { type: Array, default: () => [] },
    vehicles: { type: Array, default: () => [] },
    tours: { type: Array, default: () => [] },
  },
  emits: ['create-tour', 'assign-order', 'assign-vehicle', 'update-tour-state', 'cancel-tour'],
  data() {
    return {
      isFormVisible: false,
      isAssignModalVisible: false,
      assignTargetTourId: null,
      dragOverTourId: null,
    }
  },
  computed: {
    availableVehicles() {
      return availableVehicles(this.vehicles)
    },
    pendingOrders() {
      return pendingOrders(this.orders)
    },
    plannedTours() {
      return this.tours.filter(tour => tour.state === 'PLANNED')
    },
    startedTours() {
      return this.tours.filter(tour => tour.state === 'STARTED')
    },
    archivedTours() {
      return this.tours
        .filter(tour => tour.state === 'FINISHED' || tour.state === 'CANCELLED')
        .slice()
        .sort((a, b) => new Date(b.date) - new Date(a.date))
    },
    formToggleLabel() {
      return this.isFormVisible ? 'Cancel' : 'New tour'
    },
  },
  methods: {
    toggleForm() {
      this.isFormVisible = !this.isFormVisible
    },
    onCreateTour(payload) {
      this.$emit('create-tour', payload)
      this.isFormVisible = false
    },
    onCancelForm() {
      this.isFormVisible = false
    },
    openAssignModal({ tourId }) {
      this.assignTargetTourId = tourId
      this.isAssignModalVisible = true
    },
    onAssignConfirm(payload) {
      this.$emit('assign-order', payload)
      this.isAssignModalVisible = false
    },
    onAssignVehicle(payload) {
      this.$emit('assign-vehicle', payload)
    },
    onUpdateTourState(payload) {
      this.$emit('update-tour-state', payload)
    },
    confirmCancelTour({ tourId }) {
      const ok = window.confirm('Cancel this tour? Any in-process orders will go back to pending.')
      if (ok) this.$emit('cancel-tour', { tourId })
    },
    onTourDragOver(event, tourId) {
      event.preventDefault()
      event.dataTransfer.dropEffect = 'move'
      this.dragOverTourId = tourId
    },
    onTourDragLeave(tourId) {
      if (this.dragOverTourId === tourId) this.dragOverTourId = null
    },
    onTourDrop(event, tourId) {
      event.preventDefault()
      const orderId = event.dataTransfer.getData('text/plain')
      this.dragOverTourId = null
      if (!orderId) return
      const alreadyAssigned = this.tours.some(tour => tour.orders?.some(order => order._id === orderId))
      if (alreadyAssigned) return
      this.$emit('assign-order', { tourId, orderId })
    },
  },
}
</script>

<template lang="pug">
section.kl-card.kl-card--flush
  .kl-card-header
    div
      h3 Tours
      p.kl-muted.dispatch-panel__sub Plan, assign and start delivery tours
    button.kl-btn.kl-btn--primary.kl-btn--sm(type="button", @click="toggleForm")
      Plus(:size="14", :stroke-width="2")
      | {{ formToggleLabel }}

  DispatcherTourCreateForm(
    v-if="isFormVisible"
    :available-vehicles="availableVehicles"
    @submit="onCreateTour"
    @cancel="onCancelForm"
  )

  template(v-if="plannedTours.length")
    .dispatch-panel__subheader Planned
    ul.dispatch-panel__list.dispatch-panel__list--tours
      DispatcherTourCard(
        v-for="tour in plannedTours"
        :key="tour._id"
        :tour="tour"
        variant="planned"
        :available-vehicles="availableVehicles"
        :is-drop-target="dragOverTourId === tour._id"
        @dragover="onTourDragOver($event, tour._id)"
        @dragleave="onTourDragLeave(tour._id)"
        @drop="onTourDrop($event, tour._id)"
        @open-assign-order="openAssignModal"
        @assign-vehicle="onAssignVehicle"
        @update-tour-state="onUpdateTourState"
        @cancel-tour="confirmCancelTour"
      )

  template(v-if="startedTours.length")
    .dispatch-panel__subheader Active
    ul.dispatch-panel__list.dispatch-panel__list--tours
      DispatcherTourCard(
        v-for="tour in startedTours"
        :key="tour._id"
        :tour="tour"
        variant="active"
        @update-tour-state="onUpdateTourState"
        @cancel-tour="confirmCancelTour"
      )

  template(v-if="archivedTours.length")
    .dispatch-panel__subheader History
    ul.dispatch-panel__list.dispatch-panel__list--tours
      DispatcherTourCard(
        v-for="tour in archivedTours"
        :key="tour._id"
        :tour="tour"
        variant="archived"
      )

  .dispatch-panel__empty.dispatch-panel__empty--big(v-if="!tours.length") No tours yet.

  DispatcherTourAssignModal(
    v-model="isAssignModalVisible"
    :tour-id="assignTargetTourId"
    :pending-orders="pendingOrders"
    @confirm="onAssignConfirm"
  )
</template>

<style scoped>
.dispatch-panel__list--tours {
  padding: 0.5rem 0;
}
</style>
