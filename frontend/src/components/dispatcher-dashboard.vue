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
    async handleCreateTour({ date, vehicleId }) {
      return this.withRefresh(() => this.createTour(this.companyId, { date, vehicle: vehicleId }))
    },
    async handleAssignOrder({ tourId, orderId }) {
      return this.withRefresh(() => this.addOrderToTour(this.companyId, tourId, orderId))
    },
    async handleAssignVehicle({ tourId, vehicleId }) {
      return this.withRefresh(() => this.assignVehicleToTour(tourId, vehicleId, this.companyId))
    },
    async handleUpdateTourState({ tourId, state }) {
      return this.withRefresh(() => this.updateTour(this.companyId, tourId, { state }))
    },
    async handleCancelTour({ tourId }) {
      return this.handleUpdateTourState({ tourId, state: 'CANCELLED' })
    },
    async handleDeleteOrder({ orderId }) {
      try {
        await this.withRefresh(() => this.deleteOrderByCompany(this.companyId, orderId))
      } catch {
        // mixin sets errorMessage
      }
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
