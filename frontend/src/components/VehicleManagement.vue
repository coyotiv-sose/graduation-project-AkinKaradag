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

.card
  .card-header
    h2.mb-0 Vehicles
  .list-group.list-group-flush
    .list-group-item.list-group-item-action(v-for='vehicle in vehicles' :key='vehicle._id')
      .d-flex.justify-content-between.align-items-center
        span.fw-semibold {{ vehicle.name || vehicle.brand + ' ' + vehicle.model }}
        span.badge(:class='stateClass(vehicle.state)') {{ vehicle.state }}
      .d-flex.justify-content-between.align-items-center.mt-1
        small.text-secondary {{ vehicle.brand }} {{ vehicle.model }} ({{ vehicle.year }}) · {{ vehicle.payLoad }} kg
        select.form-select.form-select-sm.w-auto(
          @change='updateState(vehicle._id, $event.target.value)'
          :value='vehicle.state'
        )
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
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  font-size: 0.95rem;
}

h2 {
  margin-top: 2rem;
  margin-bottom: 0.75rem;
}
</style>
