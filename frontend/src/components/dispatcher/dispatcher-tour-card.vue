<script>
import { ChevronRight, Plus } from 'lucide-vue-next'
import { formatDate } from '@/utils/format'
import { tourBadgeClass } from '@/utils/badge-classes'
import { vehicleName } from '@/utils/dispatcher-selectors'

const TOUR_VARIANTS = ['planned', 'active', 'archived']

export default {
  name: 'DispatcherTourCard',
  components: { ChevronRight, Plus },
  props: {
    tour: { type: Object, required: true },
    variant: {
      type: String,
      required: true,
      validator: value => TOUR_VARIANTS.includes(value),
    },
    availableVehicles: { type: Array, default: () => [] },
    isDropTarget: { type: Boolean, default: false },
  },
  emits: ['open-assign-order', 'assign-vehicle', 'update-tour-state', 'cancel-tour'],
  computed: {
    badgeClass() {
      return tourBadgeClass(this.tour.state)
    },
    startLocation() {
      return this.tour.orders?.[0]?.origin || this.tour.startLocation || 'No orders yet'
    },
    endLocation() {
      const last = this.tour.orders?.length ? this.tour.orders[this.tour.orders.length - 1] : null
      return last?.destination || this.tour.endLocation || 'No orders yet'
    },
    hasOrders() {
      return !!this.tour.orders?.length
    },
    canStart() {
      return !!this.tour.vehicle && this.hasOrders
    },
    canAssignVehicle() {
      return !this.tour.vehicle && this.availableVehicles.length > 0
    },
    isPlanned() {
      return this.variant === 'planned'
    },
    isActive() {
      return this.variant === 'active'
    },
    isArchived() {
      return this.variant === 'archived'
    },
    rootClass() {
      return {
        'tour-item--active': this.isActive,
        'tour-item--archived': this.isArchived,
        'tour-item--drop': this.isPlanned && this.isDropTarget,
      }
    },
  },
  methods: {
    formatDate,
    vehicleName,
    openAssignOrder() {
      this.$emit('open-assign-order', { tourId: this.tour._id })
    },
    onVehicleSelect(event) {
      const vehicleId = event.target.value
      event.target.value = ''
      if (!vehicleId) return
      this.$emit('assign-vehicle', { tourId: this.tour._id, vehicleId })
    },
    startTour() {
      this.$emit('update-tour-state', { tourId: this.tour._id, state: 'STARTED' })
    },
    finishTour() {
      this.$emit('update-tour-state', { tourId: this.tour._id, state: 'FINISHED' })
    },
    cancel() {
      this.$emit('cancel-tour', { tourId: this.tour._id })
    },
  },
}
</script>

<template lang="pug">
li.tour-item(:class="rootClass")
  .tour-item__head
    .tour-item__route
      | {{ startLocation }}
      ChevronRight(:size="14", :stroke-width="1.75")
      | {{ endLocation }}
    span(:class="badgeClass") {{ tour.state }}

  .tour-item__meta
    span {{ formatDate(tour.date) }}
    template(v-if="isPlanned")
      span &middot;
      span(v-if="tour.vehicle") Vehicle: {{ vehicleName(tour.vehicle) }}
      span(v-else) No vehicle assigned
    template(v-else)
      span(v-if="tour.vehicle") &middot;
      span(v-if="tour.vehicle") Vehicle: {{ vehicleName(tour.vehicle) }}
      template(v-if="isArchived")
        span &middot;
        span {{ tour.orders ? tour.orders.length : 0 }} order(s)

  template(v-if="!isArchived")
    .tour-item__orders(v-if="hasOrders")
      .tour-item__orders-label Orders
      .mini-order(v-for="order in tour.orders" :key="order._id")
        | {{ order.origin }}
        ChevronRight(:size="12", :stroke-width="1.75")
        | {{ order.destination }}
        span.mini-order__state(v-if="isActive") &middot; {{ order.state }}
    .tour-item__dropzone(v-if="isPlanned && !hasOrders") Drop an order here

  .tour-item__actions(v-if="isPlanned")
    button.kl-btn.kl-btn--outline.kl-btn--sm(type="button", @click="openAssignOrder")
      Plus(:size="14", :stroke-width="2")
      | Add order
    select.kl-select.kl-input--sm(
      v-if="canAssignVehicle"
      @change="onVehicleSelect"
    )
      option(value="", disabled, selected) Assign vehicle
      option(v-for="vehicle in availableVehicles", :key="vehicle._id", :value="vehicle._id")
        | {{ vehicleName(vehicle) }}
    button.kl-btn.kl-btn--primary.kl-btn--sm(
      v-if="canStart"
      type="button"
      @click="startTour"
    ) Start tour
    button.kl-btn.kl-btn--ghost.kl-btn--sm.danger-text(type="button", @click="cancel") Cancel

  .tour-item__actions(v-else-if="isActive")
    button.kl-btn.kl-btn--outline.kl-btn--sm(type="button", @click="finishTour") Finish tour
    button.kl-btn.kl-btn--ghost.kl-btn--sm.danger-text(type="button", @click="cancel") Cancel
</template>

<style scoped>
.tour-item {
  padding: 0.9rem 1.25rem;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  transition: background 0.15s ease, box-shadow 0.15s ease;
}

.tour-item:last-child {
  border-bottom: none;
}

.tour-item__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
}

.tour-item__route {
  font-weight: 500;
  color: var(--color-heading);
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  flex-wrap: wrap;
}

.tour-item__meta {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  display: flex;
  gap: 0.4rem;
  align-items: center;
  flex-wrap: wrap;
}

.tour-item__orders {
  margin-top: 0.3rem;
  padding-left: 0.75rem;
  border-left: 2px solid var(--color-primary-soft);
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.tour-item__orders-label {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
  color: var(--color-text-secondary);
  margin-bottom: 0.2rem;
}

.tour-item__actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 0.4rem;
  align-items: center;
}

.tour-item__dropzone {
  margin-top: 0.3rem;
  padding: 0.75rem;
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-sm);
  text-align: center;
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  font-style: italic;
}

.tour-item--active {
  background: var(--color-primary-softer);
}

.tour-item--archived {
  opacity: 0.7;
}

.tour-item--archived .tour-item__route {
  text-decoration: line-through;
  text-decoration-color: var(--color-border);
}

.tour-item--drop {
  background: var(--color-primary-softer);
  box-shadow: inset 0 0 0 2px var(--color-primary);
}

.mini-order {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  flex-wrap: wrap;
}

.mini-order__state {
  font-weight: 500;
  color: var(--color-text);
}

.danger-text {
  color: var(--color-danger);
}

.danger-text:hover {
  background: var(--color-danger-soft);
}
</style>
