<script>
import { ChevronRight, Trash2 } from 'lucide-vue-next'

export default {
  name: 'DispatcherDashboardOrdersPanel',
  components: { ChevronRight, Trash2 },
  props: {
    orders: { type: Array, default: () => [] },
    onDeleteOrder: { type: Function, required: true },
  },
  computed: {
    pendingOrders() {
      return this.orders.filter(order => order.state === 'PENDING')
    },
    inProcessOrders() {
      return this.orders.filter(order => order.state === 'IN_PROCESS')
    },
  },
  methods: {
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
    onOrderDragStart(event, orderId) {
      event.dataTransfer.effectAllowed = 'move'
      event.dataTransfer.setData('text/plain', orderId)
    },
    async requestDeleteOrder(orderId) {
      try {
        await this.onDeleteOrder({ orderId })
      } catch {
        return null
      }
    },
  },
}
</script>

<template lang="pug">
section.kl-card.kl-card--flush
  .kl-card-header
    div
      h3 Pending orders
      p.kl-muted.dispatch-panel__sub Drag an order onto a tour to assign it
    span.kl-badge.kl-badge--warning {{ pendingOrders.length }}
  ul.dispatch-panel__list
    li.order-item.order-item--draggable(
      v-for="order in pendingOrders"
      :key="order._id"
      draggable="true"
      @dragstart="onOrderDragStart($event, order._id)"
    )
      .order-item__row
        span.order-item__id {{ '#' + order._id.slice(-5) }}
        span(:class="orderBadgeClass(order.state)") {{ order.state }}
      .order-item__route
        | {{ order.origin }}
        ChevronRight(:size="14", :stroke-width="1.75")
        | {{ order.destination }}
      .order-item__meta
        span {{ order.cargos.length }} cargo(s)
        span &middot;
        span {{ formatDate(order.deliveryDate) }}
      .order-item__actions
        router-link.kl-btn.kl-btn--outline.kl-btn--sm(:to="`/orders/${order._id}`") Details
        button.kl-btn.kl-btn--ghost.kl-btn--sm.danger-icon(
          type="button"
          title="Delete"
          @click="requestDeleteOrder(order._id)"
        )
          Trash2(:size="14", :stroke-width="1.75")
    li.dispatch-panel__empty(v-if="!pendingOrders.length") No pending orders.

  template(v-if="inProcessOrders.length")
    .dispatch-panel__subheader In process
    ul.dispatch-panel__list
      li.order-item.order-item--active(v-for="order in inProcessOrders" :key="order._id")
        .order-item__row
          span.order-item__id {{ '#' + order._id.slice(-5) }}
          span(:class="orderBadgeClass(order.state)") {{ order.state }}
        .order-item__route
          | {{ order.origin }}
          ChevronRight(:size="14", :stroke-width="1.75")
          | {{ order.destination }}
        .order-item__meta
          span {{ order.cargos.length }} cargo(s)
          span &middot;
          span {{ formatDate(order.deliveryDate) }}
</template>

<style scoped>
.order-item {
  padding: 0.9rem 1.25rem;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.order-item:last-child {
  border-bottom: none;
}

.order-item__row {
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

.order-item__route {
  font-weight: 500;
  color: var(--color-heading);
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  flex-wrap: wrap;
}

.order-item__meta {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  display: flex;
  gap: 0.4rem;
  align-items: center;
  flex-wrap: wrap;
}

.order-item__actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 0.4rem;
  align-items: center;
}

.order-item--active {
  background: var(--color-primary-softer);
}

.order-item--draggable {
  cursor: grab;
  transition: background 0.15s ease, transform 0.1s ease;
}

.order-item--draggable:hover {
  background: var(--color-background-subtle);
}

.order-item--draggable:active {
  cursor: grabbing;
}
</style>