<script>
import { mapState, mapActions } from 'pinia'
import { useOrderStore } from '@/stores/orderStore'
import { useVehicleStore } from '@/stores/vehicleStore'
import { useTourStore } from '@/stores/tourStore'

export default {
  name: 'DispatcherDashboard',
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
    stateClass(state) {
      return {
        'PENDING': 'badge-pending',
        'IN_PROCESS': 'badge-process',
        'DELIVERED': 'badge-delivered',
        'AVAILABLE': 'badge-available',
        'ON_TOUR': 'badge-ontour',
        'IN_GARAGE': 'badge-garage',
        'PLANNED': 'badge-pending',
        'STARTED': 'badge-process',
        'FINISHED': 'badge-delivered',
        'CANCELLED': 'badge-garage',
      }[state] || ''
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
.dispatcher-dashboard
  h2 Planning Panel

  p.error(v-if='errorMessage') {{ errorMessage }}

  .panel-top
    //- LEFT: Orders
    .panel-orders.card
      .card-header
        h3.mb-0 Orders
      .list-group.list-group-flush
        .list-group-item.list-group-item-action(v-for='order in pendingOrders' :key='order._id')
          .d-flex.justify-content-between.align-items-center
            span.fw-semibold \#{{ order._id.slice(-5) }}
            span.badge(:class='stateClass(order.state)') {{ order.state }}
          .d-flex.justify-content-between.align-items-center.mt-1
            span {{ order.origin }} → {{ order.destination }}
            small {{ order.cargos.length }} cargo(s) · {{ formatDate(order.deliveryDate) }}
          .d-flex.gap-2.mt-2
            router-link(:to='`/orders/${order._id}`')
              button.btn.btn-outline-success.btn-sm Details
            button.btn.btn-danger.btn-sm(@click='deleteOrder(order._id)') Delete
      .card-body(v-if='!pendingOrders.length')
        p.text-secondary.mb-0 No pending orders

      template(v-if='inProcessOrders.length')
        .card-header
          h4.mb-0 In Process
        .list-group.list-group-flush
          .list-group-item.list-group-item-action.active(v-for='order in inProcessOrders' :key='order._id')
            .d-flex.justify-content-between.align-items-center
              span.fw-semibold \#{{ order._id.slice(-5) }}
              span.badge.bg-warning.text-dark {{ order.state }}
            .d-flex.justify-content-between.align-items-center.mt-1
              span {{ order.origin }} → {{ order.destination }}
              small {{ order.cargos.length }} cargo(s) · {{ formatDate(order.deliveryDate) }}

    //- RIGHT: Vehicles
    .panel-vehicles.card
      .card-header
        h3.mb-0 Vehicles
      .list-group.list-group-flush
        .list-group-item.list-group-item-action(v-for='vehicle in vehicles' :key='vehicle._id')
          .d-flex.justify-content-between.align-items-center
            span.fw-semibold {{ vehicle.name || vehicle.brand + ' ' + vehicle.model }}
            span.badge(:class='stateClass(vehicle.state)') {{ vehicle.state }}
          small.text-secondary {{ vehicle.payLoad }} kg capacity
      .card-body(v-if='!vehicles.length')
        p.text-secondary.mb-0 No vehicles registered
      .card-footer
        router-link.btn.btn-outline-success.btn-sm(:to='`/companies/${companyId}/vehicles`') Manage Vehicles

  //- BOTTOM: Tours
  .card.panel-tours
    .card-header.d-flex.justify-content-between.align-items-center
      h3.mb-0 Tours
      button.btn.btn-success.btn-sm(@click='showTourForm = !showTourForm') {{ showTourForm ? 'Cancel' : '+ New Tour' }}

    //- Create Tour Form
    .card-body(v-if='showTourForm')
      form.tour-form(@submit.prevent='handleCreateTour')
        input(v-model='tourForm.date' type='date' placeholder='Tour Date' required)
        input(v-model='tourForm.startLocation' placeholder='Start Location' required)
        input(v-model='tourForm.endLocation' placeholder='End Location' required)
        button.btn.btn-success.btn-sm(type='submit') Create Tour

    //- Planned Tours
    template(v-if='plannedTours.length')
      .card-header
        h4.mb-0 Planned
      .list-group.list-group-flush
        .list-group-item.list-group-item-action(v-for='tour in plannedTours' :key='tour._id')
          .d-flex.justify-content-between.align-items-center
            span.fw-semibold {{ tour.startLocation }} → {{ tour.endLocation }}
            span.badge(:class='stateClass(tour.state)') {{ tour.state }}
          small.text-secondary {{ formatDate(tour.date) }}
          small.text-secondary(v-if='tour.vehicle')
            |  · Vehicle: {{ tour.vehicle.name || tour.vehicle.brand + ' ' + tour.vehicle.model }}
          small.text-secondary(v-else)  · No vehicle assigned

          .tour-orders(v-if='tour.orders && tour.orders.length')
            p.mb-1.fw-semibold.small Orders:
            .mini-order(v-for='order in tour.orders' :key='order._id')
              | {{ order.origin }} → {{ order.destination }}

          .d-flex.gap-2.mt-2.align-items-center
            button.btn.btn-outline-success.btn-sm(@click='openAssignOrder(tour._id)') + Add Order
            select.form-select.form-select-sm.w-auto(
              v-if='!tour.vehicle && availableVehicles.length'
              @change='handleAssignVehicle(tour._id, $event.target.value); $event.target.value=""'
            )
              option(value='' disabled selected) Assign Vehicle
              option(v-for='v in availableVehicles' :key='v._id' :value='v._id')
                | {{ v.name || v.brand + ' ' + v.model }}
            button.btn.btn-success.btn-sm(
              v-if='tour.vehicle && tour.orders && tour.orders.length'
              @click='updateTourState(tour._id, "STARTED")'
            ) Start Tour

    //- Started Tours
    template(v-if='startedTours.length')
      .card-header
        h4.mb-0 Active Tours
      .list-group.list-group-flush
        .list-group-item.list-group-item-action.active(v-for='tour in startedTours' :key='tour._id')
          .d-flex.justify-content-between.align-items-center
            span.fw-semibold {{ tour.startLocation }} → {{ tour.endLocation }}
            span.badge.bg-light.text-dark {{ tour.state }}
          small {{ formatDate(tour.date) }}
          small(v-if='tour.vehicle')
            |  · Vehicle: {{ tour.vehicle.name || tour.vehicle.brand + ' ' + tour.vehicle.model }}
          .tour-orders(v-if='tour.orders && tour.orders.length')
            p.mb-1.fw-semibold.small Orders:
            .mini-order(v-for='order in tour.orders' :key='order._id')
              | {{ order.origin }} → {{ order.destination }} · {{ order.state }}
          .mt-2
            button.btn.btn-light.btn-sm(@click='updateTourState(tour._id, "FINISHED")') Finish Tour

    .card-body(v-if='!tours.length')
      p.text-secondary.mb-0 No tours yet

  //- Assign Order Modal
  .modal-overlay(v-if='assignModal.visible' @click.self='assignModal.visible = false')
    .modal
      h3 Assign Order to Tour
      select(v-model='assignModal.orderId')
        option(disabled value='') Select an order
        option(v-for='order in pendingOrders' :key='order._id' :value='order._id')
          | {{ order.origin }} → {{ order.destination }} ({{ formatDate(order.deliveryDate) }})
      .modal-actions
        button.btn-primary(:disabled='!assignModal.orderId' @click='assignOrderToTour') Assign
        button(@click='assignModal.visible = false') Cancel
</template>

<style scoped>
@import '@/assets/shared.css';

.dispatcher-dashboard {
  width: 100%;
}

h2 {
  margin-bottom: 1rem;
}

.panel-top {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.panel-orders,
.panel-vehicles {
  flex: 1;
  max-height: 500px;
  overflow-y: auto;
}

.tour-form {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.tour-form input {
  padding: 0.5rem;
  border: 1px solid var(--color-input-border);
  border-radius: var(--radius);
  font-size: 0.9rem;
  background: var(--color-input-bg);
  color: var(--color-text);
}

.tour-orders {
  margin-top: 0.5rem;
  padding-left: 0.5rem;
}

.mini-order {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  padding: 0.2rem 0;
  border-left: 2px solid var(--color-primary);
  padding-left: 0.5rem;
  margin-bottom: 0.2rem;
}

.list-group-item.active {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
}

.list-group-item.active .mini-order {
  color: rgba(255, 255, 255, 0.8);
  border-left-color: rgba(255, 255, 255, 0.5);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modal {
  background: var(--color-background-card);
  padding: 1.5rem;
  border-radius: var(--radius);
  min-width: 400px;
  box-shadow: var(--shadow-md);
}

.modal h3 {
  margin-bottom: 1rem;
}

.modal select {
  width: 100%;
  padding: 0.5rem;
  font-size: 0.95rem;
  margin-bottom: 1rem;
}

.modal-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}
</style>
