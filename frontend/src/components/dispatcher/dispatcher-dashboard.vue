<script>
import { mapState, mapActions } from 'pinia'
import { useOrderStore } from '@/stores/order-store'
import { useVehicleStore } from '@/stores/vehicle-store'
import { useTourStore } from '@/stores/tour-store'
import AssignOrderModal from './assign-order-modal.vue'
import DispatcherFleetPanel from './dispatcher-fleet-panel.vue'
import DispatcherKpiRow from './dispatcher-kpi-row.vue'
import DispatcherOrdersPanel from './dispatcher-orders-panel.vue'
import DispatcherToursPanel from './dispatcher-tours-panel.vue'
import { apiErrorMessage } from '@/utils/error-helpers'

export default {
  name: 'DispatcherDashboard',
  components: {
    AssignOrderModal,
    DispatcherFleetPanel,
    DispatcherKpiRow,
    DispatcherOrdersPanel,
    DispatcherToursPanel,
  },
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
        vehicleId: '',
      },
      assignModal: {
        visible: false,
        tourId: null,
        orderId: null,
        vehicleId: null,
      },
      dragOverTourId: null,
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
    archivedTours() {
      return this.tours
        .filter(t => t.state === 'FINISHED' || t.state === 'CANCELLED')
        .slice()
        .sort((a, b) => new Date(b.date) - new Date(a.date))
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
    async handleCreateTour() {
      this.errorMessage = ''
      try {
        await this.createTour(this.companyId, {
          date: this.tourForm.date,
          vehicle: this.tourForm.vehicleId,
        })
        this.tourForm = { date: '', vehicleId: '' }
        this.showTourForm = false
      } catch (e) {
        this.errorMessage = apiErrorMessage(e)
      }
    },
    openAssignOrder(tourId) {
      this.assignModal = { visible: true, tourId, orderId: null, vehicleId: null }
    },
    closeAssignModal() {
      this.assignModal = { visible: false, tourId: null, orderId: null, vehicleId: null }
    },
    async assignOrderToTour() {
      this.errorMessage = ''
      try {
        await this.addOrderToTour(this.companyId, this.assignModal.tourId, this.assignModal.orderId)
        this.assignModal = { visible: false, tourId: null, orderId: null, vehicleId: null }
        await this.refreshAll()
      } catch (e) {
        this.errorMessage = apiErrorMessage(e)
      }
    },
    async handleAssignVehicle(tourId, vehicleId) {
      this.errorMessage = ''
      try {
        await this.assignVehicleToTour(tourId, vehicleId, this.companyId)
        await this.refreshAll()
      } catch (e) {
        this.errorMessage = apiErrorMessage(e)
      }
    },
    onOrderDragStart(event, orderId) {
      event.dataTransfer.effectAllowed = 'move'
      event.dataTransfer.setData('text/plain', orderId)
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
      const alreadyAssigned = this.tours.some(t => t.orders?.some(o => o._id === orderId))
      if (alreadyAssigned) return
      this.errorMessage = ''
      try {
        await this.addOrderToTour(this.companyId, tourId, orderId)
        await this.refreshAll()
      } catch (e) {
        this.errorMessage = apiErrorMessage(e)
      }
    },
    async updateTourState(tourId, state) {
      this.errorMessage = ''
      try {
        await this.updateTour(this.companyId, tourId, { state })
        await this.refreshAll()
      } catch (e) {
        this.errorMessage = apiErrorMessage(e)
      }
    },
    async cancelTour(tourId) {
      const confirmed = window.confirm('Cancel this tour? Any in-process orders will go back to pending.')
      if (!confirmed) return
      await this.updateTourState(tourId, 'CANCELLED')
    },
    async deleteOrder(orderId) {
      this.errorMessage = ''
      try {
        await this.deleteOrderByCompany(this.companyId, orderId)
        await this.getOrdersByCompany(this.companyId)
      } catch (e) {
        this.errorMessage = apiErrorMessage(e)
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

  DispatcherKpiRow(
    :pending-count="pendingOrders.length",
    :active-tours-count="startedTours.length",
    :planned-tours-count="plannedTours.length",
    :available-vehicles-count="availableVehicles.length",
    :vehicle-count="vehicles.length"
  )

  .dispatcher__grid
    DispatcherOrdersPanel(
      :pending-orders="pendingOrders",
      :in-process-orders="inProcessOrders",
      @drag-order-start="onOrderDragStart",
      @delete-order="deleteOrder"
    )
    DispatcherToursPanel(
      :show-tour-form="showTourForm",
      :tour-form="tourForm",
      :available-vehicles="availableVehicles",
      :planned-tours="plannedTours",
      :started-tours="startedTours",
      :archived-tours="archivedTours",
      :tours="tours",
      :drag-over-tour-id="dragOverTourId",
      @toggle-tour-form="showTourForm = !showTourForm",
      @update-tour-vehicle="tourForm.vehicleId = $event",
      @update-tour-date="tourForm.date = $event",
      @create-tour="handleCreateTour",
      @open-assign-order="openAssignOrder",
      @assign-vehicle="handleAssignVehicle",
      @update-tour-state="updateTourState",
      @cancel-tour="cancelTour",
      @tour-drag-over="onTourDragOver",
      @tour-drag-leave="onTourDragLeave",
      @tour-drop="onTourDrop"
    )

  DispatcherFleetPanel(:vehicles="vehicles", :company-id="companyId")

  AssignOrderModal(
    :visible="assignModal.visible",
    :pending-orders="pendingOrders",
    :order-id="assignModal.orderId",
    @update-order-id="assignModal.orderId = $event",
    @close="closeAssignModal",
    @assign="assignOrderToTour"
  )
</template>

<style scoped>
.dispatcher {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.dispatcher__grid {
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  gap: 1.25rem;
}

@media (max-width: 960px) {
  .dispatcher__grid {
    grid-template-columns: 1fr;
  }
}
</style>
