<script>
import { mapState, mapActions } from 'pinia'
import { useOrderStore } from '@/stores/order-store'
import { useVehicleStore } from '@/stores/vehicle-store'
import { useTourStore } from '@/stores/tour-store'
import { Plus, Trash2, Truck, Package, Route, ChevronRight } from 'lucide-vue-next'

export default {
  name: 'DispatcherDashboard',
  components: { Plus, Trash2, Truck, Package, Route, ChevronRight },
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
        startLocation: '',
        endLocation: '',
      },
      assignModal: {
        visible: false,
        tourId: null,
        orderId: null,
        vehicleId: null,
      },
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
    formatDate(date) {
      return new Date(date).toLocaleDateString()
    },
    orderBadgeClass(state) {
      return {
        PENDING: 'kl-badge kl-badge--warning',
        IN_PROCESS: 'kl-badge kl-badge--info',
        DELIVERED: 'kl-badge kl-badge--primary',
      }[state] || 'kl-badge kl-badge--muted'
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
    tourBadgeClass(state) {
      return {
        PLANNED: 'kl-badge kl-badge--warning',
        STARTED: 'kl-badge kl-badge--info',
        FINISHED: 'kl-badge kl-badge--primary',
        CANCELLED: 'kl-badge kl-badge--danger',
      }[state] || 'kl-badge kl-badge--muted'
    },
    vehicleName(v) {
      return v.name || `${v.brand} ${v.model}`
    },
    async handleCreateTour() {
      this.errorMessage = ''
      try {
        await this.createTour(this.companyId, this.tourForm)
        this.tourForm = { date: '', startLocation: '', endLocation: '' }
        this.showTourForm = false
      } catch (e) {
        this.errorMessage = e.response?.data?.error || e.message
      }
    },
    openAssignOrder(tourId) {
      this.assignModal = { visible: true, tourId, orderId: null, vehicleId: null }
    },
    async assignOrderToTour() {
      this.errorMessage = ''
      try {
        await this.addOrderToTour(this.companyId, this.assignModal.tourId, this.assignModal.orderId)
        this.assignModal = { visible: false, tourId: null, orderId: null, vehicleId: null }
        await this.refreshAll()
      } catch (e) {
        this.errorMessage = e.response?.data?.error || e.message
      }
    },
    async handleAssignVehicle(tourId, vehicleId) {
      this.errorMessage = ''
      try {
        await this.assignVehicleToTour(tourId, vehicleId)
        await this.refreshAll()
      } catch (e) {
        this.errorMessage = e.response?.data?.error || e.message
      }
    },
    async updateTourState(tourId, state) {
      this.errorMessage = ''
      try {
        await this.updateTour(this.companyId, tourId, { state })
        await this.refreshAll()
      } catch (e) {
        this.errorMessage = e.response?.data?.error || e.message
      }
    },
    async deleteOrder(orderId) {
      this.errorMessage = ''
      try {
        await this.deleteOrderByCompany(this.companyId, orderId)
        await this.getOrdersByCompany(this.companyId)
      } catch (e) {
        this.errorMessage = e.response?.data?.error || e.message
      }
    },
  },
  async mounted() {
    await this.refreshAll()
  },
}
</script>

<template>
  <div class="dispatcher">
    <div v-if="errorMessage" class="kl-alert kl-alert--danger">{{ errorMessage }}</div>

    <section class="kpi-row">
      <div class="kpi">
        <div class="kpi__icon"><Package :size="18" :stroke-width="1.75" /></div>
        <div>
          <div class="kpi__label">Pending orders</div>
          <div class="kpi__value">{{ pendingOrders.length }}</div>
        </div>
      </div>
      <div class="kpi">
        <div class="kpi__icon kpi__icon--info"><Route :size="18" :stroke-width="1.75" /></div>
        <div>
          <div class="kpi__label">Active tours</div>
          <div class="kpi__value">{{ startedTours.length }}</div>
        </div>
      </div>
      <div class="kpi">
        <div class="kpi__icon kpi__icon--warn"><Route :size="18" :stroke-width="1.75" /></div>
        <div>
          <div class="kpi__label">Planned tours</div>
          <div class="kpi__value">{{ plannedTours.length }}</div>
        </div>
      </div>
      <div class="kpi">
        <div class="kpi__icon kpi__icon--info"><Truck :size="18" :stroke-width="1.75" /></div>
        <div>
          <div class="kpi__label">Available fleet</div>
          <div class="kpi__value">{{ availableVehicles.length }} / {{ vehicles.length }}</div>
        </div>
      </div>
    </section>

    <div class="dispatcher__grid">
      <!-- LEFT: Pending orders -->
      <section class="kl-card kl-card--flush panel">
        <div class="kl-card-header">
          <div>
            <h3>Pending orders</h3>
            <p class="kl-muted panel__sub">Orders awaiting tour assignment</p>
          </div>
          <span class="kl-badge kl-badge--warning">{{ pendingOrders.length }}</span>
        </div>
        <ul class="panel__list">
          <li v-for="order in pendingOrders" :key="order._id" class="order-item">
            <div class="order-item__row">
              <span class="order-item__id">#{{ order._id.slice(-5) }}</span>
              <span :class="orderBadgeClass(order.state)">{{ order.state }}</span>
            </div>
            <div class="order-item__route">
              {{ order.origin }} <ChevronRight :size="14" :stroke-width="1.75" /> {{ order.destination }}
            </div>
            <div class="order-item__meta">
              <span>{{ order.cargos.length }} cargo(s)</span>
              <span>&middot;</span>
              <span>{{ formatDate(order.deliveryDate) }}</span>
            </div>
            <div class="order-item__actions">
              <router-link :to="`/orders/${order._id}`" class="kl-btn kl-btn--outline kl-btn--sm">
                Details
              </router-link>
              <button
                type="button"
                class="kl-btn kl-btn--ghost kl-btn--sm danger-icon"
                title="Delete"
                @click="deleteOrder(order._id)"
              >
                <Trash2 :size="14" :stroke-width="1.75" />
              </button>
            </div>
          </li>
          <li v-if="!pendingOrders.length" class="panel__empty">No pending orders.</li>
        </ul>

        <template v-if="inProcessOrders.length">
          <div class="panel__subheader">In process</div>
          <ul class="panel__list">
            <li v-for="order in inProcessOrders" :key="order._id" class="order-item order-item--active">
              <div class="order-item__row">
                <span class="order-item__id">#{{ order._id.slice(-5) }}</span>
                <span :class="orderBadgeClass(order.state)">{{ order.state }}</span>
              </div>
              <div class="order-item__route">
                {{ order.origin }} <ChevronRight :size="14" :stroke-width="1.75" /> {{ order.destination }}
              </div>
              <div class="order-item__meta">
                <span>{{ order.cargos.length }} cargo(s)</span>
                <span>&middot;</span>
                <span>{{ formatDate(order.deliveryDate) }}</span>
              </div>
            </li>
          </ul>
        </template>
      </section>

      <!-- RIGHT: Fleet -->
      <section class="kl-card kl-card--flush panel">
        <div class="kl-card-header">
          <div>
            <h3>Active fleet</h3>
            <p class="kl-muted panel__sub">Vehicle states across your company</p>
          </div>
          <router-link :to="`/companies/${companyId}/vehicles`" class="kl-btn kl-btn--ghost kl-btn--sm">
            Manage
          </router-link>
        </div>
        <ul class="panel__list">
          <li v-for="vehicle in vehicles" :key="vehicle._id" class="vehicle-item">
            <div class="vehicle-item__row">
              <div class="vehicle-item__head">
                <span class="vehicle-item__name">{{ vehicleName(vehicle) }}</span>
                <span class="vehicle-item__meta">
                  {{ vehicle.brand }} {{ vehicle.model }} &middot; {{ vehicle.payLoad }} kg
                </span>
              </div>
              <span :class="vehicleBadgeClass(vehicle.state)">{{ vehicle.state }}</span>
            </div>
          </li>
          <li v-if="!vehicles.length" class="panel__empty">No vehicles registered.</li>
        </ul>
      </section>
    </div>

    <!-- BOTTOM: Tours -->
    <section class="kl-card kl-card--flush panel">
      <div class="kl-card-header">
        <div>
          <h3>Tours</h3>
          <p class="kl-muted panel__sub">Plan, assign and start delivery tours</p>
        </div>
        <button type="button" class="kl-btn kl-btn--primary kl-btn--sm" @click="showTourForm = !showTourForm">
          <Plus :size="14" :stroke-width="2" />
          {{ showTourForm ? 'Cancel' : 'New tour' }}
        </button>
      </div>

      <div v-if="showTourForm" class="inline-form">
        <form class="tour-form" @submit.prevent="handleCreateTour">
          <div class="kl-field">
            <label class="kl-label">Date</label>
            <input v-model="tourForm.date" class="kl-input" type="date" required />
          </div>
          <div class="kl-field">
            <label class="kl-label">Start location</label>
            <input v-model="tourForm.startLocation" class="kl-input" placeholder="Depot" required />
          </div>
          <div class="kl-field">
            <label class="kl-label">End location</label>
            <input v-model="tourForm.endLocation" class="kl-input" placeholder="Destination" required />
          </div>
          <button type="submit" class="kl-btn kl-btn--primary">Create tour</button>
        </form>
      </div>

      <template v-if="plannedTours.length">
        <div class="panel__subheader">Planned</div>
        <ul class="panel__list panel__list--tours">
          <li v-for="tour in plannedTours" :key="tour._id" class="tour-item">
            <div class="tour-item__head">
              <div class="tour-item__route">
                {{ tour.startLocation }} <ChevronRight :size="14" :stroke-width="1.75" /> {{ tour.endLocation }}
              </div>
              <span :class="tourBadgeClass(tour.state)">{{ tour.state }}</span>
            </div>
            <div class="tour-item__meta">
              <span>{{ formatDate(tour.date) }}</span>
              <span>&middot;</span>
              <span v-if="tour.vehicle">Vehicle: {{ vehicleName(tour.vehicle) }}</span>
              <span v-else>No vehicle assigned</span>
            </div>
            <div v-if="tour.orders && tour.orders.length" class="tour-item__orders">
              <div class="tour-item__orders-label">Orders</div>
              <div v-for="order in tour.orders" :key="order._id" class="mini-order">
                {{ order.origin }} <ChevronRight :size="12" :stroke-width="1.75" /> {{ order.destination }}
              </div>
            </div>
            <div class="tour-item__actions">
              <button type="button" class="kl-btn kl-btn--outline kl-btn--sm" @click="openAssignOrder(tour._id)">
                <Plus :size="14" :stroke-width="2" /> Add order
              </button>
              <select
                v-if="!tour.vehicle && availableVehicles.length"
                class="kl-select kl-input--sm"
                @change="handleAssignVehicle(tour._id, $event.target.value); $event.target.value=''"
              >
                <option value="" disabled selected>Assign vehicle</option>
                <option v-for="v in availableVehicles" :key="v._id" :value="v._id">
                  {{ vehicleName(v) }}
                </option>
              </select>
              <button
                v-if="tour.vehicle && tour.orders && tour.orders.length"
                type="button"
                class="kl-btn kl-btn--primary kl-btn--sm"
                @click="updateTourState(tour._id, 'STARTED')"
              >
                Start tour
              </button>
            </div>
          </li>
        </ul>
      </template>

      <template v-if="startedTours.length">
        <div class="panel__subheader">Active</div>
        <ul class="panel__list panel__list--tours">
          <li v-for="tour in startedTours" :key="tour._id" class="tour-item tour-item--active">
            <div class="tour-item__head">
              <div class="tour-item__route">
                {{ tour.startLocation }} <ChevronRight :size="14" :stroke-width="1.75" /> {{ tour.endLocation }}
              </div>
              <span :class="tourBadgeClass(tour.state)">{{ tour.state }}</span>
            </div>
            <div class="tour-item__meta">
              <span>{{ formatDate(tour.date) }}</span>
              <span v-if="tour.vehicle">&middot;</span>
              <span v-if="tour.vehicle">Vehicle: {{ vehicleName(tour.vehicle) }}</span>
            </div>
            <div v-if="tour.orders && tour.orders.length" class="tour-item__orders">
              <div class="tour-item__orders-label">Orders</div>
              <div v-for="order in tour.orders" :key="order._id" class="mini-order">
                {{ order.origin }} <ChevronRight :size="12" :stroke-width="1.75" /> {{ order.destination }}
                <span class="mini-order__state">&middot; {{ order.state }}</span>
              </div>
            </div>
            <div class="tour-item__actions">
              <button
                type="button"
                class="kl-btn kl-btn--outline kl-btn--sm"
                @click="updateTourState(tour._id, 'FINISHED')"
              >
                Finish tour
              </button>
            </div>
          </li>
        </ul>
      </template>

      <div v-if="!tours.length" class="panel__empty panel__empty--big">No tours yet.</div>
    </section>

    <!-- Assign modal -->
    <div v-if="assignModal.visible" class="kl-modal-overlay" @click.self="assignModal.visible = false">
      <div class="kl-modal">
        <div class="kl-modal-header">
          <h3>Assign order</h3>
        </div>
        <div class="kl-modal-body">
          <div class="kl-field">
            <label class="kl-label">Select an order</label>
            <select v-model="assignModal.orderId" class="kl-select">
              <option disabled value="">Select an order</option>
              <option v-for="order in pendingOrders" :key="order._id" :value="order._id">
                {{ order.origin }} -> {{ order.destination }} ({{ formatDate(order.deliveryDate) }})
              </option>
            </select>
          </div>
        </div>
        <div class="kl-modal-footer">
          <button type="button" class="kl-btn kl-btn--ghost" @click="assignModal.visible = false">
            Cancel
          </button>
          <button
            type="button"
            class="kl-btn kl-btn--primary"
            :disabled="!assignModal.orderId"
            @click="assignOrderToTour"
          >
            Assign
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dispatcher {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.kpi-row {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.85rem;
}

.kpi {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 1rem 1.15rem;
  background: var(--color-background-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
}

.kpi__icon {
  width: 38px;
  height: 38px;
  border-radius: var(--radius-sm);
  background: var(--color-primary-soft);
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
}
.kpi__icon--info  { background: var(--color-info-soft);    color: var(--color-info); }
.kpi__icon--warn  { background: var(--color-warning-soft); color: var(--color-warning); }

.kpi__label {
  font-size: 0.72rem;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
}

.kpi__value {
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--color-heading);
  letter-spacing: -0.01em;
  margin-top: 0.1rem;
}

.dispatcher__grid {
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  gap: 1.25rem;
}

.panel__sub {
  margin: 0.25rem 0 0;
  font-size: 0.8rem;
}

.panel__list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.panel__list--tours {
  padding: 0.5rem 0;
}

.panel__subheader {
  padding: 0.6rem 1.25rem;
  background: var(--color-background-subtle);
  border-top: 1px solid var(--color-border);
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
  color: var(--color-text-secondary);
}

.panel__empty {
  padding: 1.5rem 1.25rem;
  color: var(--color-text-secondary);
  font-size: 0.875rem;
  font-style: italic;
  text-align: center;
}

.panel__empty--big {
  padding: 3rem 1.25rem;
}

.order-item,
.vehicle-item,
.tour-item {
  padding: 0.9rem 1.25rem;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.order-item:last-child,
.vehicle-item:last-child,
.tour-item:last-child {
  border-bottom: none;
}

.order-item__row,
.vehicle-item__row,
.tour-item__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
}

.order-item__id {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: var(--color-text-secondary);
}

.order-item__route,
.tour-item__route {
  font-weight: 500;
  color: var(--color-heading);
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  flex-wrap: wrap;
}

.order-item__meta,
.tour-item__meta {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  display: flex;
  gap: 0.4rem;
  align-items: center;
  flex-wrap: wrap;
}

.order-item__actions,
.tour-item__actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 0.4rem;
  align-items: center;
}

.order-item--active,
.tour-item--active {
  background: var(--color-primary-softer);
}

.vehicle-item__head {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  min-width: 0;
}

.vehicle-item__name {
  font-weight: 500;
  color: var(--color-heading);
}

.vehicle-item__meta {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
}

.tour-item__orders {
  margin-top: 0.3rem;
  padding-left: 0.75rem;
  border-left: 2px solid var(--color-primary-soft);
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.tour-item__orders-label {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
  color: var(--color-text-secondary);
  margin-bottom: 0.2rem;
}

.mini-order {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  flex-wrap: wrap;
}

.mini-order__state {
  font-weight: 500;
  color: var(--color-text);
}

.inline-form {
  padding: 1.25rem;
  background: var(--color-background-subtle);
  border-bottom: 1px solid var(--color-border);
}

.tour-form {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr)) auto;
  gap: 0.85rem;
  align-items: end;
}

.danger-icon:hover {
  color: var(--color-danger);
  background: var(--color-danger-soft);
}

@media (max-width: 960px) {
  .kpi-row {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .dispatcher__grid {
    grid-template-columns: 1fr;
  }
  .tour-form {
    grid-template-columns: 1fr;
  }
}
</style>
