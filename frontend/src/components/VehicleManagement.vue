<script>
import { useVehicleStore } from '@/stores/vehicleStore'
import CreateFormWrapper from './CreateFormWrapper.vue'

export default {
  name: 'VehicleManagement',
  components: { CreateFormWrapper },
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
    vehicles() {
      return useVehicleStore().vehicles
    },
  },
  async mounted() {
    await useVehicleStore().getAllVehicles(this.companyId)
  },
  methods: {
    async submitVehicle() {
      await useVehicleStore().createVehicle(this.companyId, {
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
    stateClass(state) {
      return {
        'AVAILABLE': 'badge-available',
        'ON_TOUR': 'badge-ontour',
        'IN_GARAGE': 'badge-garage',
        'DAMAGED': 'badge-damaged',
        'PARKED': 'badge-parked',
        'SOLD': 'badge-sold',
      }[state] || ''
    },
    async updateState(vehicleId, state) {
      await useVehicleStore().updateVehicle(this.companyId, vehicleId, { state })
    },
  },
}
</script>

<template lang="pug">
CreateFormWrapper(:onSubmit='submitVehicle', submitLabel='Add Vehicle')
  h3 New Vehicle
  input(v-model='name' placeholder='Vehicle Name (optional)')
  input(v-model='brand' placeholder='Brand' required)
  input(v-model='model' placeholder='Model' required)
  input(v-model.number='year' type='number' placeholder='Year' required)
  input(v-model='payLoad' type='number' placeholder='Payload (kg)' required)

h2 Vehicles
.vehicle-list
  .vehicle-card(v-for='vehicle in vehicles' :key='vehicle._id')
    .vehicle-header
      span.vehicle-name {{ vehicle.name || vehicle.brand + ' ' + vehicle.model }}
      span.badge(:class='stateClass(vehicle.state)') {{ vehicle.state }}
    p {{ vehicle.brand }} {{ vehicle.model }} ({{ vehicle.year }})
    p.payload Payload: {{ vehicle.payLoad }} kg
    .state-actions
      label Update Status:
      select(@change='updateState(vehicle._id, $event.target.value)' :value='vehicle.state')
        option(value='AVAILABLE') Available
        option(value='IN_GARAGE') In Garage
        option(value='DAMAGED') Damaged
        option(value='PARKED') Parked
        option(value='SOLD') Sold
        option(value='OTHER_REASON') Other
</template>

<style scoped>
@import '@/assets/shared.css';

input {
  display: block;
  width: 100%;
  padding: 0.5rem;
  margin-bottom: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 0.95rem;
}

h2 {
  margin-top: 2rem;
  margin-bottom: 0.75rem;
}

.vehicle-card {
  background: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 0.75rem;
}

.vehicle-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
}

.vehicle-name {
  font-weight: 600;
  font-size: 1.05rem;
}

.payload {
  color: #666;
  font-size: 0.9rem;
}

.state-actions {
  margin-top: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.state-actions label {
  font-size: 0.85rem;
  color: #666;
}

.state-actions select {
  padding: 0.3rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 0.85rem;
}
</style>
