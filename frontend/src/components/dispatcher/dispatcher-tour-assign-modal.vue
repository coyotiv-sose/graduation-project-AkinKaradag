<script>
import { formatDate } from '@/utils/format'

export default {
  name: 'DispatcherTourAssignModal',
  props: {
    modelValue: { type: Boolean, default: false },
    tourId: { type: String, default: null },
    pendingOrders: { type: Array, default: () => [] },
  },
  emits: ['update:modelValue', 'confirm'],
  data() {
    return { selectedOrderId: '' }
  },
  computed: {
    canConfirm() {
      return !!this.selectedOrderId
    },
  },
  watch: {
    modelValue(opened) {
      if (!opened) this.selectedOrderId = ''
    },
  },
  methods: {
    formatDate,
    close() {
      this.$emit('update:modelValue', false)
    },
    confirm() {
      if (!this.canConfirm) return
      this.$emit('confirm', { tourId: this.tourId, orderId: this.selectedOrderId })
    },
  },
}
</script>

<template lang="pug">
.kl-modal-overlay(v-if="modelValue", @click.self="close")
  .kl-modal
    .kl-modal-header
      h3 Assign order
    .kl-modal-body
      .kl-field
        label.kl-label Select an order
        select.kl-select(v-model="selectedOrderId")
          option(disabled, value="") Select an order
          option(v-for="order in pendingOrders", :key="order._id", :value="order._id")
            | {{ order.origin }} -> {{ order.destination }} ({{ formatDate(order.deliveryDate) }})
    .kl-modal-footer
      button.kl-btn.kl-btn--ghost(type="button", @click="close") Cancel
      button.kl-btn.kl-btn--primary(type="button", :disabled="!canConfirm", @click="confirm") Assign
</template>
