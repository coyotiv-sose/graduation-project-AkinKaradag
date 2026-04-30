<script>
import { mapState, mapActions } from 'pinia'
import { useOrderStore } from '@/stores/order-store'
import { useVehicleStore } from '@/stores/vehicle-store'
import { useTourStore } from '@/stores/tour-store'
import DispatcherDashboardFleetPanel from '@/components/dispatcher-dashboard-fleet-panel.vue'
import DispatcherDashboardOrdersPanel from '@/components/dispatcher-dashboard-orders-panel.vue'
import DispatcherDashboardSummary from '@/components/dispatcher-dashboard-summary.vue'
import DispatcherDashboardToursPanel from '@/components/dispatcher-dashboard-tours-panel.vue'

const errorMessageFrom = error => error.response?.data?.error || error.message

export default {
  name: 'DispatcherDashboard',
  components: {
    DispatcherDashboardFleetPanel,
    DispatcherDashboardOrdersPanel,
    DispatcherDashboardSummary,
    DispatcherDashboardToursPanel,
  },
  props: {
    companyId: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      errorMessage: '',
      isLoading: false,
    }
  },
  computed: {
    ...mapState(useOrderStore, ['orders']),
    ...mapState(useVehicleStore, ['vehicles']),
    ...mapState(useTourStore, ['tours']),
  },
  watch: {
    companyId: {
      immediate: true,
      async handler() {
        await this.loadDispatcherData()
      },
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
    async loadDispatcherData() {
      this.errorMessage = ''
      this.isLoading = true

      try {
        await this.refreshAll()
      } catch (error) {
        this.errorMessage = errorMessageFrom(error)
      } finally {
        this.isLoading = false
      }
    },
    async runAction(action) {
      this.errorMessage = ''

      try {
        const result = await action()
        await this.refreshAll()
        return result
      } catch (error) {
        this.errorMessage = errorMessageFrom(error)
        throw error
      }
    },
    async handleCreateTour({ date, vehicleId }) {
      return this.runAction(() => this.createTour(this.companyId, { date, vehicle: vehicleId }))
    },
    async handleAssignOrder({ tourId, orderId }) {
      return this.runAction(() => this.addOrderToTour(this.companyId, tourId, orderId))
    },
    async handleAssignVehicle({ tourId, vehicleId }) {
      return this.runAction(() => this.assignVehicleToTour(tourId, vehicleId, this.companyId))
    },
    async handleUpdateTourState({ tourId, state }) {
      return this.runAction(() => this.updateTour(this.companyId, tourId, { state }))
    },
    async handleCancelTour({ tourId }) {
      return this.handleUpdateTourState({ tourId, state: 'CANCELLED' })
    },
    async handleDeleteOrder({ orderId }) {
      return this.runAction(() => this.deleteOrderByCompany(this.companyId, orderId))
    },
  },
}
</script>

<template lang="pug">
.dispatcher
  p.kl-muted.loading-state(v-if="isLoading && !errorMessage") Loading dispatcher data...
  .kl-alert.kl-alert--danger(v-if="errorMessage") {{ errorMessage }}

  DispatcherDashboardSummary(
    :orders="orders"
    :vehicles="vehicles"
    :tours="tours"
  )

  .dispatcher__grid
    DispatcherDashboardOrdersPanel(
      :orders="orders"
      :on-delete-order="handleDeleteOrder"
    )
    DispatcherDashboardToursPanel(
      :orders="orders"
      :vehicles="vehicles"
      :tours="tours"
      :on-create-tour="handleCreateTour"
      :on-assign-order="handleAssignOrder"
      :on-assign-vehicle="handleAssignVehicle"
      :on-update-tour-state="handleUpdateTourState"
      :on-cancel-tour="handleCancelTour"
    )

  DispatcherDashboardFleetPanel(
    :company-id="companyId"
    :vehicles="vehicles"
  )
</template>

<style scoped>
.dispatcher {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.loading-state {
  margin: 0;
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
