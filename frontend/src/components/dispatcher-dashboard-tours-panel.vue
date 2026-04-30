<script>
import { Plus, ChevronRight } from 'lucide-vue-next'

export default {
  name: 'DispatcherDashboardToursPanel',
  components: { Plus, ChevronRight },
  props: {
    orders: { type: Array, default: () => [] },
    vehicles: { type: Array, default: () => [] },
    tours: { type: Array, default: () => [] },
    onCreateTour: { type: Function, required: true },
    onAssignOrder: { type: Function, required: true },
    onAssignVehicle: { type: Function, required: true },
    onUpdateTourState: { type: Function, required: true },
    onCancelTour: { type: Function, required: true },
  },
  data() {
    return {
      showTourForm: false,
      tourForm: {
        date: '',
        vehicleId: '',
      },
      assignModal: {
        visible: false,
        tourId: null,
        orderId: '',
      },
      dragOverTourId: null,
    }
  },
  computed: {
    pendingOrders() {
      return this.orders.filter(order => order.state === 'PENDING')
    },
    availableVehicles() {
      return this.vehicles.filter(vehicle => vehicle.state === 'AVAILABLE')
    },
    startedTours() {
      return this.tours.filter(tour => tour.state === 'STARTED')
    },
    plannedTours() {
      return this.tours.filter(tour => tour.state === 'PLANNED')
    },
    archivedTours() {
      return this.tours
        .filter(tour => tour.state === 'FINISHED' || tour.state === 'CANCELLED')
        .slice()
        .sort((a, b) => new Date(b.date) - new Date(a.date))
    },
  },
  methods: {
    formatDate(date) {
      return new Date(date).toLocaleDateString()
    },
    vehicleName(vehicle) {
      return vehicle.name || `${vehicle.brand} ${vehicle.model}`
    },
    tourBadgeClass(state) {
      return {
        PLANNED: 'kl-badge kl-badge--warning',
        STARTED: 'kl-badge kl-badge--info',
        FINISHED: 'kl-badge kl-badge--primary',
        CANCELLED: 'kl-badge kl-badge--danger',
      }[state] || 'kl-badge kl-badge--muted'
    },
    tourStartLocation(tour) {
      return tour.orders?.[0]?.origin || tour.startLocation || 'No orders yet'
    },
    tourEndLocation(tour) {
      const last = tour.orders?.length ? tour.orders[tour.orders.length - 1] : null
      return last?.destination || tour.endLocation || 'No orders yet'
    },
    resetTourForm() {
      this.tourForm = { date: '', vehicleId: '' }
    },
    toggleTourForm() {
      this.showTourForm = !this.showTourForm
      if (!this.showTourForm) {
        this.resetTourForm()
      }
    },
    openAssignOrder(tourId) {
      this.assignModal = { visible: true, tourId, orderId: '' }
    },
    closeAssignOrder() {
      this.assignModal = { visible: false, tourId: null, orderId: '' }
    },
    async submitCreateTour() {
      try {
        await this.onCreateTour({ ...this.tourForm })
        this.resetTourForm()
        this.showTourForm = false
      } catch {
        return null
      }
    },
    async submitAssignOrder() {
      try {
        await this.onAssignOrder({
          tourId: this.assignModal.tourId,
          orderId: this.assignModal.orderId,
        })
        this.closeAssignOrder()
      } catch {
        return null
      }
    },
    async assignVehicle(tourId, vehicleId) {
      if (!vehicleId) return
      try {
        await this.onAssignVehicle({ tourId, vehicleId })
      } catch {
        return null
      }
    },
    async handleVehicleSelect(tourId, event) {
      const vehicleId = event.target.value
      event.target.value = ''
      await this.assignVehicle(tourId, vehicleId)
    },
    async updateTourState(tourId, state) {
      try {
        await this.onUpdateTourState({ tourId, state })
      } catch {
        return null
      }
    },
    async cancelTour(tourId) {
      const confirmed = window.confirm('Cancel this tour? Any in-process orders will go back to pending.')
      if (!confirmed) return
      try {
        await this.onCancelTour({ tourId })
      } catch {
        return null
      }
    },
    onTourDragOver(event, tourId) {
      event.preventDefault()
      event.dataTransfer.dropEffect = 'move'
      this.dragOverTourId = tourId
    },
    onTourDragLeave(tourId) {
      if (this.dragOverTourId === tourId) this.dragOverTourId = null
    },
    async onTourDrop(event, tourId) {
      event.preventDefault()
      const orderId = event.dataTransfer.getData('text/plain')
      this.dragOverTourId = null
      if (!orderId) return

      const alreadyAssigned = this.tours.some(tour => tour.orders?.some(order => order._id === orderId))
      if (alreadyAssigned) return

      try {
        await this.onAssignOrder({ tourId, orderId })
      } catch {
        return null
      }
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
    button.kl-btn.kl-btn--primary.kl-btn--sm(type="button", @click="toggleTourForm")
      Plus(:size="14", :stroke-width="2")
      | {{ showTourForm ? 'Cancel' : 'New tour' }}

  .inline-form(v-if="showTourForm")
    form.tour-form(@submit.prevent="submitCreateTour")
      .kl-field
        label.kl-label Vehicle
        select.kl-select(v-model="tourForm.vehicleId", required)
          option(value="", disabled) Select a vehicle
          option(v-for="vehicle in availableVehicles", :key="vehicle._id", :value="vehicle._id")
            | {{ vehicleName(vehicle) }}
      .kl-field
        label.kl-label Date
        input.kl-input(v-model="tourForm.date", type="date", required)
      button.kl-btn.kl-btn--primary(type="submit", :disabled="!tourForm.vehicleId || !tourForm.date") Create tour
    p.kl-muted.tour-form__hint(v-if="!availableVehicles.length")
      | No available vehicles. Add or free up a vehicle to create a tour.

  template(v-if="plannedTours.length")
    .dispatch-panel__subheader Planned
    ul.dispatch-panel__list.dispatch-panel__list--tours
      li.tour-item(
        v-for="tour in plannedTours"
        :key="tour._id"
        :class="{ 'tour-item--drop': dragOverTourId === tour._id }"
        @dragover="onTourDragOver($event, tour._id)"
        @dragleave="onTourDragLeave(tour._id)"
        @drop="onTourDrop($event, tour._id)"
      )
        .tour-item__head
          .tour-item__route
            | {{ tourStartLocation(tour) }}
            ChevronRight(:size="14", :stroke-width="1.75")
            | {{ tourEndLocation(tour) }}
          span(:class="tourBadgeClass(tour.state)") {{ tour.state }}
        .tour-item__meta
          span {{ formatDate(tour.date) }}
          span &middot;
          span(v-if="tour.vehicle") Vehicle: {{ vehicleName(tour.vehicle) }}
          span(v-else) No vehicle assigned
        .tour-item__orders(v-if="tour.orders && tour.orders.length")
          .tour-item__orders-label Orders
          div.mini-order(v-for="order in tour.orders" :key="order._id")
            | {{ order.origin }}
            ChevronRight(:size="12", :stroke-width="1.75")
            | {{ order.destination }}
        .tour-item__dropzone(v-else) Drop an order here
        .tour-item__actions
          button.kl-btn.kl-btn--outline.kl-btn--sm(type="button", @click="openAssignOrder(tour._id)")
            Plus(:size="14", :stroke-width="2")
            | Add order
          select.kl-select.kl-input--sm(
            v-if="!tour.vehicle && availableVehicles.length"
            @change="handleVehicleSelect(tour._id, $event)"
          )
            option(value="", disabled, selected) Assign vehicle
            option(v-for="vehicle in availableVehicles", :key="vehicle._id", :value="vehicle._id")
              | {{ vehicleName(vehicle) }}
          button.kl-btn.kl-btn--primary.kl-btn--sm(
            v-if="tour.vehicle && tour.orders && tour.orders.length"
            type="button"
            @click="updateTourState(tour._id, 'STARTED')"
          ) Start tour
          button.kl-btn.kl-btn--ghost.kl-btn--sm.danger-text(type="button", @click="cancelTour(tour._id)") Cancel

  template(v-if="startedTours.length")
    .dispatch-panel__subheader Active
    ul.dispatch-panel__list.dispatch-panel__list--tours
      li.tour-item.tour-item--active(v-for="tour in startedTours" :key="tour._id")
        .tour-item__head
          .tour-item__route
            | {{ tourStartLocation(tour) }}
            ChevronRight(:size="14", :stroke-width="1.75")
            | {{ tourEndLocation(tour) }}
          span(:class="tourBadgeClass(tour.state)") {{ tour.state }}
        .tour-item__meta
          span {{ formatDate(tour.date) }}
          span(v-if="tour.vehicle") &middot;
          span(v-if="tour.vehicle") Vehicle: {{ vehicleName(tour.vehicle) }}
        .tour-item__orders(v-if="tour.orders && tour.orders.length")
          .tour-item__orders-label Orders
          div.mini-order(v-for="order in tour.orders" :key="order._id")
            | {{ order.origin }}
            ChevronRight(:size="12", :stroke-width="1.75")
            | {{ order.destination }}
            span.mini-order__state &middot; {{ order.state }}
        .tour-item__actions
          button.kl-btn.kl-btn--outline.kl-btn--sm(type="button", @click="updateTourState(tour._id, 'FINISHED')") Finish tour
          button.kl-btn.kl-btn--ghost.kl-btn--sm.danger-text(type="button", @click="cancelTour(tour._id)") Cancel

  template(v-if="archivedTours.length")
    .dispatch-panel__subheader History
    ul.dispatch-panel__list.dispatch-panel__list--tours
      li.tour-item.tour-item--archived(v-for="tour in archivedTours" :key="tour._id")
        .tour-item__head
          .tour-item__route
            | {{ tourStartLocation(tour) }}
            ChevronRight(:size="14", :stroke-width="1.75")
            | {{ tourEndLocation(tour) }}
          span(:class="tourBadgeClass(tour.state)") {{ tour.state }}
        .tour-item__meta
          span {{ formatDate(tour.date) }}
          span(v-if="tour.vehicle") &middot;
          span(v-if="tour.vehicle") Vehicle: {{ vehicleName(tour.vehicle) }}
          span &middot;
          span {{ tour.orders ? tour.orders.length : 0 }} order(s)

  .dispatch-panel__empty.dispatch-panel__empty--big(v-if="!tours.length") No tours yet.

  .kl-modal-overlay(v-if="assignModal.visible" @click.self="closeAssignOrder")
    .kl-modal
      .kl-modal-header
        h3 Assign order
      .kl-modal-body
        .kl-field
          label.kl-label Select an order
          select.kl-select(v-model="assignModal.orderId")
            option(disabled, value="") Select an order
            option(v-for="order in pendingOrders" :key="order._id" :value="order._id")
              | {{ order.origin }} -> {{ order.destination }} ({{ formatDate(order.deliveryDate) }})
      .kl-modal-footer
        button.kl-btn.kl-btn--ghost(type="button", @click="closeAssignOrder") Cancel
        button.kl-btn.kl-btn--primary(type="button", :disabled="!assignModal.orderId", @click="submitAssignOrder") Assign
</template>

<style scoped>
.dispatch-panel__list--tours {
  padding: 0.5rem 0;
}

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

.tour-item--active {
  background: var(--color-primary-softer);
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

.tour-item--drop {
  background: var(--color-primary-softer);
  box-shadow: inset 0 0 0 2px var(--color-primary);
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

.danger-text {
  color: var(--color-danger);
}

.danger-text:hover {
  background: var(--color-danger-soft);
}

.tour-item--archived {
  opacity: 0.7;
}

.tour-item--archived .tour-item__route {
  text-decoration: line-through;
  text-decoration-color: var(--color-border);
}

@media (max-width: 960px) {
  .tour-form {
    grid-template-columns: 1fr;
  }
}
</style>