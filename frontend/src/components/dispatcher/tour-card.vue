<script>
import { ChevronRight, Plus } from 'lucide-vue-next'
import { formatDate, tourBadgeClass, vehicleName } from '@/utils/display-helpers'

export default {
  name: 'TourCard',
  components: { ChevronRight, Plus },
  props: {
    tour: { type: Object, required: true },
    variant: {
      type: String,
      default: 'planned',
      validator: value => ['planned', 'active', 'archived'].includes(value),
    },
    dragOver: { type: Boolean, default: false },
    availableVehicles: { type: Array, default: () => [] },
  },
  emits: [
    'open-assign-order',
    'assign-vehicle',
    'update-tour-state',
    'cancel-tour',
    'drag-over',
    'drag-leave',
    'drop',
  ],
  computed: {
    isPlanned() {
      return this.variant === 'planned'
    },
    isActive() {
      return this.variant === 'active'
    },
    isArchived() {
      return this.variant === 'archived'
    },
    tourClasses() {
      return {
        'tour-item--active': this.isActive,
        'tour-item--archived': this.isArchived,
        'tour-item--drop': this.dragOver,
      }
    },
  },
  methods: {
    formatDate,
    tourBadgeClass,
    vehicleName,
    tourStartLocation(tour) {
      return tour.orders?.[0]?.origin || tour.startLocation || 'No orders yet'
    },
    tourEndLocation(tour) {
      const last = tour.orders?.length ? tour.orders[tour.orders.length - 1] : null
      return last?.destination || tour.endLocation || 'No orders yet'
    },
    assignVehicle(event) {
      this.$emit('assign-vehicle', this.tour._id, event.target.value)
      event.target.value = ''
    },
    handleDragOver(event) {
      if (this.isPlanned) this.$emit('drag-over', event, this.tour._id)
    },
    handleDragLeave() {
      if (this.isPlanned) this.$emit('drag-leave', this.tour._id)
    },
    handleDrop(event) {
      if (this.isPlanned) this.$emit('drop', event, this.tour._id)
    },
  },
}
</script>

<template lang="pug">
li.tour-item(
  :class="tourClasses",
  @dragover="handleDragOver",
  @dragleave="handleDragLeave",
  @drop="handleDrop"
)
  .tour-item__head
    .tour-item__route
      | {{ tourStartLocation(tour) }}
      ChevronRight(:size="14", :stroke-width="1.75")
      | {{ tourEndLocation(tour) }}
    span(:class="tourBadgeClass(tour.state)") {{ tour.state }}

  .tour-item__meta(v-if="isPlanned")
    span {{ formatDate(tour.date) }}
    span &middot;
    span(v-if="tour.vehicle") Vehicle: {{ vehicleName(tour.vehicle) }}
    span(v-else) No vehicle assigned

  .tour-item__meta(v-else-if="isActive")
    span {{ formatDate(tour.date) }}
    span(v-if="tour.vehicle") &middot;
    span(v-if="tour.vehicle") Vehicle: {{ vehicleName(tour.vehicle) }}

  .tour-item__meta(v-else)
    span {{ formatDate(tour.date) }}
    span(v-if="tour.vehicle") &middot;
    span(v-if="tour.vehicle") Vehicle: {{ vehicleName(tour.vehicle) }}
    span &middot;
    span {{ tour.orders ? tour.orders.length : 0 }} order(s)

  .tour-item__orders(v-if="tour.orders && tour.orders.length")
    .tour-item__orders-label Orders
    div.mini-order(v-for="order in tour.orders", :key="order._id")
      | {{ order.origin }}
      ChevronRight(:size="12", :stroke-width="1.75")
      | {{ order.destination }}
      span.mini-order__state(v-if="isActive") &middot; {{ order.state }}
  .tour-item__dropzone(v-else-if="isPlanned") Drop an order here

  .tour-item__actions(v-if="isPlanned")
    button.kl-btn.kl-btn--outline.kl-btn--sm(type="button", @click="$emit('open-assign-order', tour._id)")
      Plus(:size="14", :stroke-width="2")
      | Add order
    select.kl-select.kl-input--sm(
      v-if="!tour.vehicle && availableVehicles.length",
      @change="assignVehicle"
    )
      option(value="", disabled, selected) Assign vehicle
      option(v-for="vehicle in availableVehicles", :key="vehicle._id", :value="vehicle._id") {{ vehicleName(vehicle) }}
    button.kl-btn.kl-btn--primary.kl-btn--sm(
      v-if="tour.vehicle && tour.orders && tour.orders.length",
      type="button",
      @click="$emit('update-tour-state', tour._id, 'STARTED')"
    ) Start tour
    button.kl-btn.kl-btn--ghost.kl-btn--sm.danger-text(type="button", @click="$emit('cancel-tour', tour._id)") Cancel

  .tour-item__actions(v-else-if="isActive")
    button.kl-btn.kl-btn--outline.kl-btn--sm(type="button", @click="$emit('update-tour-state', tour._id, 'FINISHED')") Finish tour
    button.kl-btn.kl-btn--ghost.kl-btn--sm.danger-text(type="button", @click="$emit('cancel-tour', tour._id)") Cancel
</template>

<style scoped src="./dispatcher-shared.css"></style>
