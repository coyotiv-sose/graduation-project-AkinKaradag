<script>
import { mapState, mapActions } from 'pinia'
import { useVehicleStore } from '@/stores/vehicle-store'
import CreateFormWrapper from './create-form-wrapper.vue'
import { Truck } from 'lucide-vue-next'

export default {
  name: 'VehicleManagement',
  components: { CreateFormWrapper, Truck },
  props: {
    companyId: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      name: '',
      brand: '',
      model: '',
      year: new Date().getFullYear(),
      payLoad: '',
    }
  },
  computed: {
    ...mapState(useVehicleStore, ['vehicles']),
  },
  methods: {
    ...mapActions(useVehicleStore, ['getAllVehicles', 'createVehicle', 'updateVehicle']),
    async submitVehicle() {
      await this.createVehicle(this.companyId, {
        name: this.name,
        brand: this.brand,
        model: this.model,
        year: this.year,
        payLoad: Number(this.payLoad),
      })
      this.name = ''
      this.brand = ''
      this.model = ''
      this.year = new Date().getFullYear()
      this.payLoad = ''
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
    async updateState(vehicleId, state) {
      await this.updateVehicle(this.companyId, vehicleId, { state })
    },
    vehicleName(v) {
      return v.name || `${v.brand} ${v.model}`
    },
  },
  async mounted() {
    await this.getAllVehicles(this.companyId)
  },
}
</script>


<template lang="pug">
div.vehicle-block
  CreateFormWrapper(:on-submit="submitVehicle", submit-label="Add vehicle")
    h3 New vehicle
    input(v-model="name", placeholder="Vehicle name (optional)")
    .vehicle-block__row
      input(v-model="brand", placeholder="Brand", required)
      input(v-model="model", placeholder="Model", required)
    .vehicle-block__row
      input(v-model.number="year", type="number", placeholder="Year", required)
      input(v-model="payLoad", type="number", placeholder="Payload (kg)", required)
  section.kl-card.kl-card--flush
    .kl-card-header
      h2 Vehicles
      span.kl-badge.kl-badge--muted {{ vehicles.length }}
    ul.list
      li.vehicle-item(v-for="vehicle in vehicles", :key="vehicle._id")
        .vehicle-item__icon
          Truck(:size="18", :stroke-width="1.75")
        .vehicle-item__info
          .vehicle-item__head
            span.vehicle-item__name {{ vehicleName(vehicle) }}
            span(:class="vehicleBadgeClass(vehicle.state)") {{ vehicle.state }}
          .vehicle-item__meta
            | {{ vehicle.brand }} {{ vehicle.model }} ({{ vehicle.year }}) · {{ vehicle.payLoad }} kg
        select.kl-select.kl-input--sm.vehicle-item__state(:value="vehicle.state", @change="updateState(vehicle._id, $event.target.value)")
          option(value="AVAILABLE") Available
          option(value="IN_GARAGE") In garage
          option(value="DAMAGED") Damaged
          option(value="PARKED") Parked
          option(value="SOLD") Sold
          option(value="OTHER_REASON") Other
      li.list__empty(v-if="!vehicles.length") No vehicles yet.
</template>

<style scoped>
.vehicle-block__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}

.vehicle-block__row :deep(input) {
  margin: 0;
}

.list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.vehicle-item {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 0.85rem;
  padding: 0.85rem 1.25rem;
  border-bottom: 1px solid var(--color-border);
}

.vehicle-item:last-child {
  border-bottom: none;
}

.vehicle-item__icon {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm);
  background: var(--color-primary-soft);
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.vehicle-item__head {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.vehicle-item__name {
  font-weight: 500;
  color: var(--color-heading);
}

.vehicle-item__meta {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  margin-top: 0.15rem;
}

.vehicle-item__state {
  max-width: 160px;
}

.list__empty {
  padding: 1.5rem 1.25rem;
  text-align: center;
  color: var(--color-text-secondary);
  font-style: italic;
}

@media (max-width: 720px) {
  .vehicle-item {
    grid-template-columns: auto 1fr;
  }
  .vehicle-item__state {
    grid-column: 1 / -1;
    max-width: none;
  }
}
</style>
