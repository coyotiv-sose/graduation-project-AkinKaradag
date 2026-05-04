<script>
import { ChevronRight, Trash2 } from 'lucide-vue-next'
import { formatDate, orderBadgeClass } from '@/utils/display-helpers'

export default {
  name: 'DispatcherOrdersPanel',
  components: { ChevronRight, Trash2 },
  props: {
    pendingOrders: { type: Array, default: () => [] },
    inProcessOrders: { type: Array, default: () => [] },
  },
  emits: ['drag-order-start', 'delete-order'],
  methods: {
    formatDate,
    orderBadgeClass,
  },
}
</script>

<template lang="pug">
section.kl-card.kl-card--flush.panel
  .kl-card-header
    div
      h3 Pending orders
      p.kl-muted.panel__sub Drag an order onto a tour to assign it
    span.kl-badge.kl-badge--warning {{ pendingOrders.length }}
  ul.panel__list
    li.order-item.order-item--draggable(
      v-for="order in pendingOrders",
      :key="order._id",
      draggable="true",
      @dragstart="$emit('drag-order-start', $event, order._id)"
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
          type="button",
          title="Delete",
          @click="$emit('delete-order', order._id)"
        )
          Trash2(:size="14", :stroke-width="1.75")
    li.panel__empty(v-if="!pendingOrders.length") No pending orders.

  template(v-if="inProcessOrders.length")
    .panel__subheader In process
    ul.panel__list
      li.order-item.order-item--active(v-for="order in inProcessOrders", :key="order._id")
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

<style scoped src="./dispatcher-shared.css"></style>
