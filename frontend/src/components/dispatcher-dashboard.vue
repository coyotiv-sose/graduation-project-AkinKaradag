<script>
import { mapState, mapActions } from 'pinia'
import { useOrderStore } from '@/stores/order-store'
import { useVehicleStore } from '@/stores/vehicle-store'
import { useTourStore } from '@/stores/tour-store'
import dispatcherDataMixin from '@/mixins/dispatcher-data-mixin'
import DispatcherDashboardFleetPanel from '@/components/dispatcher-dashboard-fleet-panel.vue'
import DispatcherDashboardOrdersPanel from '@/components/dispatcher-dashboard-orders-panel.vue'
import DispatcherDashboardSummary from '@/components/dispatcher-dashboard-summary.vue'
import DispatcherDashboardToursPanel from '@/components/dispatcher-dashboard-tours-panel.vue'

export default {
  name: 'DispatcherDashboard',
  mixins: [dispatcherDataMixin],
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
    /** Wraps withRefresh so emit-based children don't await the promise; mixin still surfaces errorMessage. */
    async runStoreAction(action) {
      try {
        await this.withRefresh(action)
      } catch {
        // mixin already populated errorMessage
      }
    },
    handleCreateTour({ date, vehicleId }) {
      return this.runStoreAction(() => this.createTour(this.companyId, { date, vehicle: vehicleId }))
    },
    handleAssignOrder({ tourId, orderId }) {
      return this.runStoreAction(() => this.addOrderToTour(this.companyId, tourId, orderId))
    },
    handleAssignVehicle({ tourId, vehicleId }) {
      return this.runStoreAction(() => this.assignVehicleToTour(tourId, vehicleId, this.companyId))
    },
    handleUpdateTourState({ tourId, state }) {
      return this.runStoreAction(() => this.updateTour(this.companyId, tourId, { state }))
    },
    handleCancelTour({ tourId }) {
      return this.handleUpdateTourState({ tourId, state: 'CANCELLED' })
    },
    handleDeleteOrder({ orderId }) {
      return this.runStoreAction(() => this.deleteOrderByCompany(this.companyId, orderId))
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
      @delete-order="handleDeleteOrder"
    )
    DispatcherDashboardToursPanel(
      :orders="orders"
      :vehicles="vehicles"
      :tours="tours"
      @create-tour="handleCreateTour"
      @assign-order="handleAssignOrder"
      @assign-vehicle="handleAssignVehicle"
      @update-tour-state="handleUpdateTourState"
      @cancel-tour="handleCancelTour"
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
