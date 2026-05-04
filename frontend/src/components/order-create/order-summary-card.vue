<script>
import { shortAddress, formatBillingLine } from '@/utils/order-form-helpers'

export default {
  name: 'OrderSummaryCard',
  props: {
    customer: { type: Object, default: null },
    billingInfo: { type: Object, default: null },
    origin: { type: Object, required: true },
    destination: { type: Object, required: true },
    deliveryDate: { type: String, default: '' },
    cargos: { type: Array, default: () => [] },
    showCustomer: { type: Boolean, default: false },
  },
  computed: {
    customerName() {
      return this.customer ? this.customer.customerName : 'Not selected'
    },
    billingLine() {
      return formatBillingLine(this.billingInfo)
    },
    originLine() {
      return shortAddress(this.origin)
    },
    destinationLine() {
      return shortAddress(this.destination)
    },
    formattedDeliveryDate() {
      if (!this.deliveryDate) return '—'
      return new Date(this.deliveryDate).toLocaleDateString(undefined, {
        weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
      })
    },
    totalUnits() {
      return this.cargos.reduce((sum, c) => sum + Number(c.quantity || 0), 0)
    },
    totalWeight() {
      return this.cargos.reduce((sum, c) => sum + Number(c.quantity || 0) * Number(c.weight || 0), 0)
    },
  },
}
</script>

<template lang="pug">
.kl-card.kl-card--padded.summary
  h3 Order summary
  p.kl-muted.summary__sub Live preview based on your inputs.
  .summary-row(v-if="showCustomer")
    span.summary-row__label Customer
    span.summary-row__value {{ customerName }}
  .summary-row
    span.summary-row__label Billing
    span.summary-row__value {{ billingLine }}
  .summary-row
    span.summary-row__label Origin
    span.summary-row__value {{ originLine }}
  .summary-row
    span.summary-row__label Destination
    span.summary-row__value {{ destinationLine }}
  .summary-row
    span.summary-row__label Delivery
    span.summary-row__value {{ formattedDeliveryDate }}
  .kl-divider
  .summary-stats
    div
      .summary-stats__label Cargo items
      .summary-stats__value {{ cargos.length }}
    div
      .summary-stats__label Total units
      .summary-stats__value {{ totalUnits }}
    div
      .summary-stats__label Total weight
      .summary-stats__value {{ totalWeight }} kg
</template>

<style scoped>
.summary h3 {
  margin: 0;
  font-size: 1rem;
}

.summary__sub {
  margin: 0.25rem 0 1rem;
  font-size: 0.85rem;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.55rem 0;
  font-size: 0.875rem;
}

.summary-row__label {
  color: var(--color-text-secondary);
  font-weight: 500;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.summary-row__value {
  color: var(--color-heading);
  text-align: right;
  font-weight: 500;
}

.summary-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.5rem;
}

.summary-stats__label {
  font-size: 0.7rem;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
}

.summary-stats__value {
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-heading);
  margin-top: 0.15rem;
}
</style>
