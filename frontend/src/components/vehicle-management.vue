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

<template>
  <div class="vehicle-block">
    <CreateFormWrapper :on-submit="submitVehicle" submit-label="Add vehicle">
      <h3>New vehicle</h3>
      <input v-model="name" placeholder="Vehicle name (optional)" />
      <div class="vehicle-block__row">
        <input v-model="brand" placeholder="Brand" required />
        <input v-model="model" placeholder="Model" required />
      </div>
      <div class="vehicle-block__row">
        <input v-model.number="year" type="number" placeholder="Year" required />
        <input v-model="payLoad" type="number" placeholder="Payload (kg)" required />
      </div>
    </CreateFormWrapper>

    <section class="kl-card kl-card--flush">
      <div class="kl-card-header">
        <h2>Vehicles</h2>
        <span class="kl-badge kl-badge--muted">{{ vehicles.length }}</span>
      </div>

      <ul class="list">
        <li v-for="vehicle in vehicles" :key="vehicle._id" class="vehicle-item">
          <div class="vehicle-item__icon">
            <Truck :size="18" :stroke-width="1.75" />
          </div>
          <div class="vehicle-item__info">
            <div class="vehicle-item__head">
              <span class="vehicle-item__name">{{ vehicleName(vehicle) }}</span>
              <span :class="vehicleBadgeClass(vehicle.state)">{{ vehicle.state }}</span>
            </div>
            <div class="vehicle-item__meta">
              {{ vehicle.brand }} {{ vehicle.model }} ({{ vehicle.year }}) &middot; {{ vehicle.payLoad }} kg
            </div>
          </div>
          <select
            class="kl-select kl-input--sm vehicle-item__state"
            :value="vehicle.state"
            @change="updateState(vehicle._id, $event.target.value)"
          >
            <option value="AVAILABLE">Available</option>
            <option value="IN_GARAGE">In garage</option>
            <option value="DAMAGED">Damaged</option>
            <option value="PARKED">Parked</option>
            <option value="SOLD">Sold</option>
            <option value="OTHER_REASON">Other</option>
          </select>
        </li>
        <li v-if="!vehicles.length" class="list__empty">No vehicles yet.</li>
      </ul>
    </section>
  </div>
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
