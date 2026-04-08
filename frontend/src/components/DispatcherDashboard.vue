<script>
import { useOrderStore } from '@/stores/orderStore'
import { useVehicleStore } from '@/stores/vehicleStore'
import { useTourStore } from '@/stores/tourStore'
import { useCompanyStore } from '@/stores/companyStore'

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
    orders() {
      return useOrderStore().orders
    },
    vehicles() {
      return useVehicleStore().vehicles
    },
    tours() {
      return useTourStore().tours
    },
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
  async mounted() {
    await this.refreshAll()
  },
  methods: {
    async refreshAll() {
      await Promise.all([
        useOrderStore().getOrdersByCompany(this.companyId),
        useVehicleStore().getAllVehicles(this.companyId),
        useTourStore().getAllTours(this.companyId),
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
    async createTour() {
      this.errorMessage = ''
      try {
        await useTourStore().createTour(this.companyId, this.tourForm)
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
        await useTourStore().addOrderToTour(this.companyId, this.assignModal.tourId, this.assignModal.orderId)
        this.assignModal = { visible: false, tourId: null, orderId: null, vehicleId: null }
        await this.refreshAll()
      } catch (e) {
        this.errorMessage = e.response?.data?.error || e.message
      }
    },
    async assignVehicleToTour(tourId, vehicleId) {
      this.errorMessage = ''
      try {
        await useTourStore().assignVehicleToTour(tourId, vehicleId)
        await this.refreshAll()
      } catch (e) {
        this.errorMessage = e.response?.data?.error || e.message
      }
    },
    async updateTourState(tourId, state) {
      this.errorMessage = ''
      try {
        await useTourStore().updateTour(this.companyId, tourId, { state })
        await this.refreshAll()
      } catch (e) {
        this.errorMessage = e.response?.data?.error || e.message
      }
    },
    async deleteOrder(orderId) {
      this.errorMessage = ''
      try {
        await useOrderStore().deleteOrderByCompany(this.companyId, orderId)
        await useOrderStore().getOrdersByCompany(this.companyId)
      } catch (e) {
        this.errorMessage = e.response?.data?.error || e.message
      }
    },
  },
}
</script>

<template lang="pug">
.dispatcher-dashboard
  h2 Planning Panel

  p.error(v-if='errorMessage') {{ errorMessage }}

  .panel-top
    //- LEFT: Orders
    .panel-orders
      h3 Orders
      .order-card(v-for='order in pendingOrders' :key='order._id')
        .order-header
          span.order-id \#{{ order._id.slice(-5) }}
          span.badge(:class='stateClass(order.state)') {{ order.state }}
        p.route {{ order.origin }} → {{ order.destination }}
        p.meta {{ order.cargos.length }} cargo(s) · {{ formatDate(order.deliveryDate) }}
        .order-actions
          router-link(:to='`/orders/${order._id}`')
            button.btn-sm Details
          button.btn-sm.btn-danger(@click='deleteOrder(order._id)') Delete

      p.empty(v-if='!pendingOrders.length') No pending orders

      template(v-if='inProcessOrders.length')
        h4 In Process
        .order-card.in-process(v-for='order in inProcessOrders' :key='order._id')
          .order-header
            span.order-id \#{{ order._id.slice(-5) }}
            span.badge(:class='stateClass(order.state)') {{ order.state }}
          p.route {{ order.origin }} → {{ order.destination }}
          p.meta {{ order.cargos.length }} cargo(s) · {{ formatDate(order.deliveryDate) }}

    //- RIGHT: Vehicles
    .panel-vehicles
      h3 Vehicles
      .vehicle-card(v-for='vehicle in vehicles' :key='vehicle._id')
        .vehicle-header
          span.vehicle-name {{ vehicle.name || vehicle.brand + ' ' + vehicle.model }}
          span.badge(:class='stateClass(vehicle.state)') {{ vehicle.state }}
        p.meta {{ vehicle.payLoad }} kg capacity
      p.empty(v-if='!vehicles.length') No vehicles registered
      router-link(:to='`/companies/${companyId}/vehicles`')
        button.btn-sm Manage Vehicles

  //- BOTTOM: Tours
  .panel-tours
    .tours-header
      h3 Tours
      button.btn-primary(@click='showTourForm = !showTourForm') {{ showTourForm ? 'Cancel' : '+ New Tour' }}

    //- Create Tour Form
    form.tour-form(v-if='showTourForm' @submit.prevent='createTour')
      input(v-model='tourForm.date' type='date' placeholder='Tour Date' required)
      input(v-model='tourForm.startLocation' placeholder='Start Location' required)
      input(v-model='tourForm.endLocation' placeholder='End Location' required)
      button(type='submit') Create Tour

    //- Planned Tours
    template(v-if='plannedTours.length')
      h4 Planned
      .tour-card(v-for='tour in plannedTours' :key='tour._id')
        .tour-header
          span.tour-route {{ tour.startLocation }} → {{ tour.endLocation }}
          span.badge(:class='stateClass(tour.state)') {{ tour.state }}
        p.meta {{ formatDate(tour.date) }}
        p.meta(v-if='tour.vehicle')
          | Vehicle: {{ tour.vehicle.name || tour.vehicle.brand + ' ' + tour.vehicle.model }}
        p.meta(v-else) No vehicle assigned

        .tour-orders(v-if='tour.orders && tour.orders.length')
          p Orders:
          .mini-order(v-for='order in tour.orders' :key='order._id')
            | {{ order.origin }} → {{ order.destination }}

        .tour-actions
          button.btn-sm(@click='openAssignOrder(tour._id)') + Add Order
          select.vehicle-select(
            v-if='!tour.vehicle && availableVehicles.length'
            @change='assignVehicleToTour(tour._id, $event.target.value); $event.target.value=""'
          )
            option(value='' disabled selected) Assign Vehicle
            option(v-for='v in availableVehicles' :key='v._id' :value='v._id')
              | {{ v.name || v.brand + ' ' + v.model }}
          button.btn-sm.btn-primary(
            v-if='tour.vehicle && tour.orders && tour.orders.length'
            @click='updateTourState(tour._id, "STARTED")'
          ) Start Tour

    //- Started Tours
    template(v-if='startedTours.length')
      h4 Active Tours
      .tour-card.active-tour(v-for='tour in startedTours' :key='tour._id')
        .tour-header
          span.tour-route {{ tour.startLocation }} → {{ tour.endLocation }}
          span.badge(:class='stateClass(tour.state)') {{ tour.state }}
        p.meta {{ formatDate(tour.date) }}
        p.meta(v-if='tour.vehicle')
          | Vehicle: {{ tour.vehicle.name || tour.vehicle.brand + ' ' + tour.vehicle.model }}
        .tour-orders(v-if='tour.orders && tour.orders.length')
          p Orders:
          .mini-order(v-for='order in tour.orders' :key='order._id')
            | {{ order.origin }} → {{ order.destination }} · {{ order.state }}
        .tour-actions
          button.btn-sm.btn-primary(@click='updateTourState(tour._id, "FINISHED")') Finish Tour

    p.empty(v-if='!tours.length') No tours yet

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
  background: #f9f9f9;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1rem;
  max-height: 500px;
  overflow-y: auto;
}

h3 {
  margin-bottom: 0.75rem;
  font-size: 1.1rem;
}

h4 {
  margin: 1rem 0 0.5rem;
  color: #555;
}

.order-card {
  background: white;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
}

.order-card.in-process {
  border-left: 3px solid #e6a817;
}

.order-header,
.vehicle-header,
.tour-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
}

.order-id {
  font-weight: 600;
  font-size: 0.9rem;
}

.route {
  font-weight: 500;
  margin: 0.25rem 0;
}

.order-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.vehicle-card {
  background: white;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
}

.vehicle-name {
  font-weight: 600;
}

.panel-tours {
  background: #f9f9f9;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1rem;
}

.tours-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.tour-form {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.tour-form input {
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 0.9rem;
}

.tour-form button {
  padding: 0.5rem 1rem;
  background: #2c7a2c;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.tour-card {
  background: white;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
}

.tour-card.active-tour {
  border-left: 3px solid #2c7a2c;
}

.tour-route {
  font-weight: 600;
}

.tour-orders {
  margin-top: 0.5rem;
  padding-left: 0.5rem;
}

.tour-orders p {
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.mini-order {
  font-size: 0.8rem;
  color: #555;
  padding: 0.2rem 0;
  border-left: 2px solid #2c7a2c;
  padding-left: 0.5rem;
  margin-bottom: 0.2rem;
}

.tour-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
  align-items: center;
}

.vehicle-select {
  padding: 0.3rem;
  font-size: 0.85rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.btn-primary:disabled {
  background: #999;
  cursor: not-allowed;
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
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  min-width: 400px;
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
