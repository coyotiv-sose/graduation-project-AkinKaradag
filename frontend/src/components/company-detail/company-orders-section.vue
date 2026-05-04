<script>
import { ChevronRight, Pencil, Trash2 } from 'lucide-vue-next'
import OrderEditPanel from './order-edit-panel.vue'
import { formatDate, orderBadgeClass } from '@/utils/display-helpers'

export default {
  name: 'CompanyOrdersSection',
  components: { ChevronRight, Pencil, Trash2, OrderEditPanel },
  props: {
    orders: { type: Array, default: () => [] },
    editingOrderId: { type: [String, Number], default: null },
    orderForm: { type: Object, required: true },
  },
  emits: ['edit-order', 'delete-order', 'update-order-form', 'submit-order', 'cancel-order'],
  methods: {
    formatDate,
    orderBadgeClass,
  },
}
</script>

<template lang="pug">
section.kl-card.kl-card--flush.section
  .kl-card-header
    div
      h2 Orders
      p.kl-muted.section-sub All transport orders for this company.
    span.kl-badge.kl-badge--muted {{ orders.length }}
  ul.list(v-if="orders.length")
    li.list-item(v-for="order in orders", :key="order._id")
      .list-item__main.order-main
        .order-main__route
          span.order-main__arrow
            | {{ order.origin }}
            ChevronRight(:size="14", :stroke-width="1.75")
            | {{ order.destination }}
          .order-main__meta
            span {{ order.customer?.customerName || '' }}
            span &middot;
            span {{ formatDate(order.deliveryDate) }}
        span(:class="orderBadgeClass(order.state)") {{ order.state }}
        .list-item__actions
          button.kl-btn.kl-btn--ghost.kl-btn--sm(title="Edit", @click="$emit('edit-order', order)")
            Pencil(:size="14", :stroke-width="1.75")
          button.kl-btn.kl-btn--ghost.kl-btn--sm.danger-icon(
            title="Delete"
            @click="$emit('delete-order', order._id)"
          )
            Trash2(:size="14", :stroke-width="1.75")
      OrderEditPanel(
        v-if="editingOrderId === order._id"
        :form="orderForm"
        @update-form="$emit('update-order-form', $event)"
        @submit="$emit('submit-order')"
        @cancel="$emit('cancel-order')"
      )
  div.list__empty(v-else) No orders for this company yet.
</template>

<style scoped src="./company-detail-shared.css"></style>
