<script>
import { mapState, mapActions } from 'pinia'
import { useOrderStore } from '@/stores/order-store'
import { useVehicleStore } from '@/stores/vehicle-store'
import { useTourStore } from '@/stores/tour-store'
import { Plus, Trash2, Truck, Package, Route, ChevronRight } from 'lucide-vue-next'

export default {
  name: 'DispatcherDashboard',
  components: { Plus, Trash2, Truck, Package, Route, ChevronRight },
  props: {
    companyId: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      showTourForm: false,
      tourForm: {
        date: '',
        startLocation: '',
        endLocation: '',
      },
      assignModal: {
        visible: false,
        tourId: null,
        orderId: null,
        vehicleId: null,
      },
      errorMessage: '',
    }
  },
  computed: {
    ...mapState(useOrderStore, ['orders']),
    ...mapState(useVehicleStore, ['vehicles']),
    ...mapState(useTourStore, ['tours']),
    pendingOrders() {
      return this.orders.filter(o => o.state === 'PENDING')
    },
    inProcessOrders() {
      return this.orders.filter(o => o.state === 'IN_PROCESS')
    },
    availableVehicles() {
      return this.vehicles.filter(v => v.state === 'AVAILABLE')
    },
    startedTours() {
      return this.tours.filter(t => t.state === 'STARTED')
    },
    plannedTours() {
      return this.tours.filter(t => t.state === 'PLANNED')
    },
  },
  methods: {
    ...mapActions(useOrderStore, ['getOrdersByCompany', 'deleteOrderByCompany']),
    ...mapActions(useVehicleStore, ['getAllVehicles']),
    ...mapActions(useTourStore, ['getAllTours', 'createTour', 'addOrderToTour', 'assignVehicleToTour', 'updateTour']),
    async refreshAll() {
      await Promise.all([
        this.getOrdersByCompany(this.companyId),
        this.getAllVehicles(this.companyId),
        this.getAllTours(this.companyId),
      ])
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString()
    },
    orderBadgeClass(state) {
      return {
        PENDING: 'kl-badge kl-badge--warning',
        IN_PROCESS: 'kl-badge kl-badge--info',
        DELIVERED: 'kl-badge kl-badge--primary',
      }[state] || 'kl-badge kl-badge--muted'
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
    tourBadgeClass(state) {
      return {
        PLANNED: 'kl-badge kl-badge--warning',
        STARTED: 'kl-badge kl-badge--info',
        FINISHED: 'kl-badge kl-badge--primary',
        CANCELLED: 'kl-badge kl-badge--danger',
      }[state] || 'kl-badge kl-badge--muted'
    },
    vehicleName(v) {
      return v.name || `${v.brand} ${v.model}`
    },
    async handleCreateTour() {
      this.errorMessage = ''
      try {
        await this.createTour(this.companyId, this.tourForm)
        this.tourForm = { date: '', startLocation: '', endLocation: '' }
        this.showTourForm = false
      } catch (e) {
        this.errorMessage = e.response?.data?.error || e.message
      }
    },
    openAssignOrder(tourId) {
      this.assignModal = { visible: true, tourId, orderId: null, vehicleId: null }
    },
    async assignOrderToTour() {
      this.errorMessage = ''
      try {
        await this.addOrderToTour(this.companyId, this.assignModal.tourId, this.assignModal.orderId)
        this.assignModal = { visible: false, tourId: null, orderId: null, vehicleId: null }
        await this.refreshAll()
      } catch (e) {
        this.errorMessage = e.response?.data?.error || e.message
      }
    },
    async handleAssignVehicle(tourId, vehicleId) {
      this.errorMessage = ''
      try {
        await this.assignVehicleToTour(tourId, vehicleId)
        await this.refreshAll()
      } catch (e) {
        this.errorMessage = e.response?.data?.error || e.message
      }
    },
    async updateTourState(tourId, state) {
      this.errorMessage = ''
      try {
        await this.updateTour(this.companyId, tourId, { state })
        await this.refreshAll()
      } catch (e) {
        this.errorMessage = e.response?.data?.error || e.message
      }
    },
    async deleteOrder(orderId) {
      this.errorMessage = ''
      try {
        await this.deleteOrderByCompany(this.companyId, orderId)
        await this.getOrdersByCompany(this.companyId)
      } catch (e) {
        this.errorMessage = e.response?.data?.error || e.message
      }
    },
  },
  async mounted() {
    await this.refreshAll()
  },
}
</script>


<template lang="pug">
.dispatcher
  .kl-alert.kl-alert--danger(v-if="errorMessage") {{ errorMessage }}

  section.kpi-row
    .kpi
      .kpi__icon
        Package(:size="18", :stroke-width="1.75")
      div
        .kpi__label Pending orders
        .kpi__value {{ pendingOrders.length }}
    .kpi
      .kpi__icon.kpi__icon--info
        Route(:size="18", :stroke-width="1.75")
      div
        .kpi__label Active tours
        .kpi__value {{ startedTours.length }}
    .kpi
      .kpi__icon.kpi__icon--warn
        Route(:size="18", :stroke-width="1.75")
      div
        .kpi__label Planned tours
        .kpi__value {{ plannedTours.length }}
    .kpi
      .kpi__icon.kpi__icon--info
        Truck(:size="18", :stroke-width="1.75")
      div
        .kpi__label Available fleet
        .kpi__value {{ availableVehicles.length }} / {{ vehicles.length }}

  .dispatcher__grid
    // LEFT: Pending orders
    section.kl-card.kl-card--flush.panel
      .kl-card-header
        div
          h3 Pending orders
          p.kl-muted.panel__sub Orders awaiting tour assignment
        span.kl-badge.kl-badge--warning {{ pendingOrders.length }}
      ul.panel__list
        li.order-item(v-for="order in pendingOrders", :key="order._id")
          .order-item__row
            span.order-item__id #{{ order._id.slice(-5) }}
            span(:class="orderBadgeClass(order.state)") {{ order.state }}
          .order-item__route
            | {{ order.origin }}
            ChevronRight(:size="14", :stroke-width="1.75")
            | {{ order.destination }}
          .order-item__meta
            span {{ order.cargos.length }} cargo(s)
            span &middot;
            span {{ formatDate(order.deliveryDate) }}
          .order-item__actions
            router-link.kl-btn.kl-btn--outline.kl-btn--sm(:to="`/orders/${order._id}`") Details
            button.kl-btn.kl-btn--ghost.kl-btn--sm.danger-icon(type="button", title="Delete", @click="deleteOrder(order._id)")
              Trash2(:size="14", :stroke-width="1.75")
        li.panel__empty(v-if="!pendingOrders.length") No pending orders.

      template(v-if="inProcessOrders.length")
        .panel__subheader In process
        ul.panel__list
          li.order-item.order-item--active(v-for="order in inProcessOrders", :key="order._id")
            .order-item__row
              span.order-item__id #{{ order._id.slice(-5) }}
              span(:class="orderBadgeClass(order.state)") {{ order.state }}
            .order-item__route
              | {{ order.origin }}
              ChevronRight(:size="14", :stroke-width="1.75")
              | {{ order.destination }}
            .order-item__meta
              span {{ order.cargos.length }} cargo(s)
              span &middot;
              span {{ formatDate(order.deliveryDate) }}

    // RIGHT: Fleet
    section.kl-card.kl-card--flush.panel
      .kl-card-header
        div
          h3 Active fleet
          p.kl-muted.panel__sub Vehicle states across your company
        router-link.kl-btn.kl-btn--ghost.kl-btn--sm(:to="`/companies/${companyId}/vehicles`") Manage
      ul.panel__list
        li.vehicle-item(v-for="vehicle in vehicles", :key="vehicle._id")
          .vehicle-item__row
            .vehicle-item__head
              span.vehicle-item__name {{ vehicleName(vehicle) }}
              span.vehicle-item__meta {{ vehicle.brand }} {{ vehicle.model }} &middot; {{ vehicle.payLoad }} kg
            span(:class="vehicleBadgeClass(vehicle.state)") {{ vehicle.state }}
        li.panel__empty(v-if="!vehicles.length") No vehicles registered.

  // BOTTOM: Tours
  section.kl-card.kl-card--flush.panel
    .kl-card-header
      div
        h3 Tours
        p.kl-muted.panel__sub Plan, assign and start delivery tours
      button.kl-btn.kl-btn--primary.kl-btn--sm(type="button", @click="showTourForm = !showTourForm")
        Plus(:size="14", :stroke-width="2")
        | {{ showTourForm ? 'Cancel' : 'New tour' }}

    .inline-form(v-if="showTourForm")
      form.tour-form(@submit.prevent="handleCreateTour")
        .kl-field
          label.kl-label Date
          input.kl-input(v-model="tourForm.date", type="date", required)
        .kl-field
          label.kl-label Start location
          input.kl-input(v-model="tourForm.startLocation", placeholder="Depot", required)
        .kl-field
          label.kl-label End location
          input.kl-input(v-model="tourForm.endLocation", placeholder="Destination", required)
        button.kl-btn.kl-btn--primary(type="submit") Create tour

    template(v-if="plannedTours.length")
      .panel__subheader Planned
      ul.panel__list.panel__list--tours
        li.tour-item(v-for="tour in plannedTours", :key="tour._id")
          .tour-item__head
            .tour-item__route
              | {{ tour.startLocation }}
              ChevronRight(:size="14", :stroke-width="1.75")
              | {{ tour.endLocation }}
            span(:class="tourBadgeClass(tour.state)") {{ tour.state }}
          .tour-item__meta
            span {{ formatDate(tour.date) }}
            span &middot;
            span(v-if="tour.vehicle") Vehicle: {{ vehicleName(tour.vehicle) }}
            span(v-else) No vehicle assigned
          .tour-item__orders(v-if="tour.orders && tour.orders.length")
            .tour-item__orders-label Orders
            div.mini-order(v-for="order in tour.orders", :key="order._id")
              | {{ order.origin }}
              ChevronRight(:size="12", :stroke-width="1.75")
              | {{ order.destination }}
          .tour-item__actions
            button.kl-btn.kl-btn--outline.kl-btn--sm(type="button", @click="openAssignOrder(tour._id)")
              Plus(:size="14", :stroke-width="2") Add order
            select.kl-select.kl-input--sm(
              v-if="!tour.vehicle && availableVehicles.length"
              @change="handleAssignVehicle(tour._id, $event.target.value); $event.target.value=''"
            )
              option(value="", disabled, selected) Assign vehicle
              option(v-for="v in availableVehicles", :key="v._id", :value="v._id") {{ vehicleName(v) }}
            button.kl-btn.kl-btn--primary.kl-btn--sm(
              v-if="tour.vehicle && tour.orders && tour.orders.length"
              type="button"
              @click="updateTourState(tour._id, 'STARTED')"
            ) Start tour

    template(v-if="startedTours.length")
      .panel__subheader Active
      ul.panel__list.panel__list--tours
        li.tour-item.tour-item--active(v-for="tour in startedTours", :key="tour._id")
          .tour-item__head
            .tour-item__route
              | {{ tour.startLocation }}
              ChevronRight(:size="14", :stroke-width="1.75")
              | {{ tour.endLocation }}
            span(:class="tourBadgeClass(tour.state)") {{ tour.state }}
          .tour-item__meta
            span {{ formatDate(tour.date) }}
            span(v-if="tour.vehicle") &middot;
            span(v-if="tour.vehicle") Vehicle: {{ vehicleName(tour.vehicle) }}
          .tour-item__orders(v-if="tour.orders && tour.orders.length")
            .tour-item__orders-label Orders
            div.mini-order(v-for="order in tour.orders", :key="order._id")
              | {{ order.origin }}
              ChevronRight(:size="12", :stroke-width="1.75")
              | {{ order.destination }}
              span.mini-order__state &middot; {{ order.state }}
          .tour-item__actions
            button.kl-btn.kl-btn--outline.kl-btn--sm(type="button", @click="updateTourState(tour._id, 'FINISHED')") Finish tour

    .panel__empty.panel__empty--big(v-if="!tours.length") No tours yet.

  // Assign modal
  .kl-modal-overlay(v-if="assignModal.visible", @click.self="assignModal.visible = false")
    .kl-modal
      .kl-modal-header
        h3 Assign order
      .kl-modal-body
        .kl-field
          label.kl-label Select an order
          select.kl-select(v-model="assignModal.orderId")
            option(disabled, value="") Select an order
            option(v-for="order in pendingOrders", :key="order._id", :value="order._id")
              | {{ order.origin }} -> {{ order.destination }} ({{ formatDate(order.deliveryDate) }})
      .kl-modal-footer
        button.kl-btn.kl-btn--ghost(type="button", @click="assignModal.visible = false") Cancel
        button.kl-btn.kl-btn--primary(type="button", :disabled="!assignModal.orderId", @click="assignOrderToTour") Assign
</template>

<style scoped>
.dispatcher {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

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

.dispatcher__grid {
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  gap: 1.25rem;
}

.panel__sub {
  margin: 0.25rem 0 0;
  font-size: 0.8rem;
}

.panel__list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.panel__list--tours {
  padding: 0.5rem 0;
}

.panel__subheader {
  padding: 0.6rem 1.25rem;
  background: var(--color-background-subtle);
  border-top: 1px solid var(--color-border);
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
  color: var(--color-text-secondary);
}

.panel__empty {
  padding: 1.5rem 1.25rem;
  color: var(--color-text-secondary);
  font-size: 0.875rem;
  font-style: italic;
  text-align: center;
}

.panel__empty--big {
  padding: 3rem 1.25rem;
}

.order-item,
.vehicle-item,
.tour-item {
  padding: 0.9rem 1.25rem;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.order-item:last-child,
.vehicle-item:last-child,
.tour-item:last-child {
  border-bottom: none;
}

.order-item__row,
.vehicle-item__row,
.tour-item__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
}

.order-item__id {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: var(--color-text-secondary);
}

.order-item__route,
.tour-item__route {
  font-weight: 500;
  color: var(--color-heading);
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  flex-wrap: wrap;
}

.order-item__meta,
.tour-item__meta {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  display: flex;
  gap: 0.4rem;
  align-items: center;
  flex-wrap: wrap;
}

.order-item__actions,
.tour-item__actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 0.4rem;
  align-items: center;
}

.order-item--active,
.tour-item--active {
  background: var(--color-primary-softer);
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

.inline-form {
  padding: 1.25rem;
  background: var(--color-background-subtle);
  border-bottom: 1px solid var(--color-border);
}

.tour-form {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr)) auto;
  gap: 0.85rem;
  align-items: end;
}

.danger-icon:hover {
  color: var(--color-danger);
  background: var(--color-danger-soft);
}

@media (max-width: 960px) {
  .kpi-row {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .dispatcher__grid {
    grid-template-columns: 1fr;
  }
  .tour-form {
    grid-template-columns: 1fr;
  }
}
</style>
