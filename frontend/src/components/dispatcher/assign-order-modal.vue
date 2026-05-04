<script>
import { formatDate } from '@/utils/display-helpers'

export default {
  name: 'AssignOrderModal',
  props: {
    visible: { type: Boolean, default: false },
    pendingOrders: { type: Array, default: () => [] },
    orderId: { type: String, default: '' },
  },
  emits: ['close', 'update-order-id', 'assign'],
  methods: {
    formatDate,
  },
}
</script>

<template lang="pug">
.kl-modal-overlay(v-if="visible", @click.self="$emit('close')")
  .kl-modal
    .kl-modal-header
      h3 Assign order
    .kl-modal-body
      .kl-field
        label.kl-label Select an order
        select.kl-select(:value="orderId || ''", @change="$emit('update-order-id', $event.target.value)")
          option(disabled, value="") Select an order
          option(v-for="order in pendingOrders", :key="order._id", :value="order._id")
            | {{ order.origin }} -> {{ order.destination }} ({{ formatDate(order.deliveryDate) }})
    .kl-modal-footer
      button.kl-btn.kl-btn--ghost(type="button", @click="$emit('close')") Cancel
      button.kl-btn.kl-btn--primary(type="button", :disabled="!orderId", @click="$emit('assign')") Assign
</template>
