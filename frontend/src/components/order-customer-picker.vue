<script>
import { User } from 'lucide-vue-next'
import { customerLabel } from '@/utils/order-form-helpers'

export default {
  name: 'OrderCustomerPicker',
  components: { User },
  props: {
    modelValue: { type: String, default: '' },
    customers: { type: Array, default: () => [] },
  },
  emits: ['update:modelValue'],
  methods: {
    customerLabel,
    onChange(event) {
      this.$emit('update:modelValue', event.target.value)
    },
  },
}
</script>

<template lang="pug">
section.kl-card.kl-card--padded.kl-form-section
  header.kl-section-head
    .kl-section-icon
      User(:size="16", :stroke-width="1.75")
    div
      h3 Customer
      p.kl-muted Who is this order being booked for?
  .kl-form-row(style="--cols: 1")
    .kl-field
      label.kl-label Customer
      select.kl-select(:value="modelValue" @change="onChange" required)
        option(disabled value="") Select a customer
        option(
          v-for="customer in customers"
          :key="customer._id"
          :value="customer._id"
        ) {{ customerLabel(customer) }}
  p.kl-muted.hint(v-if="!customers.length")
    | No customers found. Add a customer first to create orders on their behalf.
</template>

<style scoped>
.hint {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  font-style: italic;
  margin: 0.5rem 0 0;
}
</style>
