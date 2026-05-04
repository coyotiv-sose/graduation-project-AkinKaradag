<script>
import { Truck, Package, Route } from 'lucide-vue-next'
import { pendingOrders, availableVehicles } from '@/utils/dispatcher-selectors'

export default {
  name: 'DispatcherDashboardSummary',
  components: { Truck, Package, Route },
  props: {
    orders: { type: Array, default: () => [] },
    vehicles: { type: Array, default: () => [] },
    tours: { type: Array, default: () => [] },
  },
  computed: {
    pendingOrdersCount() {
      return pendingOrders(this.orders).length
    },
    startedToursCount() {
      return this.tours.filter(tour => tour.state === 'STARTED').length
    },
    plannedToursCount() {
      return this.tours.filter(tour => tour.state === 'PLANNED').length
    },
    availableVehiclesCount() {
      return availableVehicles(this.vehicles).length
    },
  },
}
</script>

<template lang="pug">
section.kpi-row
  .kpi
    .kpi__icon
      Package(:size="18", :stroke-width="1.75")
    div
      .kpi__label Pending orders
      .kpi__value {{ pendingOrdersCount }}
  .kpi
    .kpi__icon.kpi__icon--info
      Route(:size="18", :stroke-width="1.75")
    div
      .kpi__label Active tours
      .kpi__value {{ startedToursCount }}
  .kpi
    .kpi__icon.kpi__icon--warn
      Route(:size="18", :stroke-width="1.75")
    div
      .kpi__label Planned tours
      .kpi__value {{ plannedToursCount }}
  .kpi
    .kpi__icon.kpi__icon--info
      Truck(:size="18", :stroke-width="1.75")
    div
      .kpi__label Available fleet
      .kpi__value {{ availableVehiclesCount }} / {{ vehicles.length }}
</template>