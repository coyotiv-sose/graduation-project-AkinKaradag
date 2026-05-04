<script>
import { vehicleBadgeClass, vehicleName } from '@/utils/display-helpers'

export default {
  name: 'DispatcherFleetPanel',
  props: {
    vehicles: { type: Array, default: () => [] },
    companyId: { type: [String, Number], required: true },
  },
  methods: {
    vehicleName,
    vehicleBadgeClass,
  },
}
</script>

<template lang="pug">
section.kl-card.kl-card--flush.panel
  .kl-card-header
    div
      h3 Active fleet
      p.kl-muted.panel__sub Vehicle states across your company
    router-link.kl-btn.kl-btn--ghost.kl-btn--sm(:to="`/companies/${companyId}/vehicles`") Manage
  ul.panel__list.panel__list--fleet
    li.vehicle-item(v-for="vehicle in vehicles", :key="vehicle._id")
      .vehicle-item__row
        .vehicle-item__head
          span.vehicle-item__name {{ vehicleName(vehicle) }}
          span.vehicle-item__meta {{ vehicle.brand }} {{ vehicle.model }} &middot; {{ vehicle.payLoad }} kg
        span(:class="vehicleBadgeClass(vehicle.state)") {{ vehicle.state }}
    li.panel__empty(v-if="!vehicles.length") No vehicles registered.
</template>

<style scoped src="./dispatcher-shared.css"></style>
