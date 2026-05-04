<script>
import { ChevronRight } from 'lucide-vue-next'
import { orderBadgeClass } from '@/utils/badge-classes'
import { formatLongDate } from '@/utils/format'
import { totalCargoWeight } from '@/utils/order-form-helpers'

export default {
  name: 'OrderDetailOverviewCard',
  components: { ChevronRight },
  props: {
    order: {
      type: Object,
      required: true,
    },
  },
  computed: {
    badgeClass() {
      return orderBadgeClass(this.order?.state)
    },
    customerLabel() {
      return this.order?.customer?.customerName || this.order?.customer || '—'
    },
    formattedDeliveryDate() {
      return formatLongDate(this.order?.deliveryDate)
    },
    orderNumber() {
      return this.order ? `#${this.order._id.slice(-5)}` : ''
    },
    totalWeight() {
      return totalCargoWeight(this.order?.cargos || [])
    },
  },
}
</script>

<template lang="pug">
section.kl-card.kl-card--padded.detail-overview
  .detail-overview__head
    div
      .kl-muted.detail-overview__label Transport status
      .detail-overview__state
        span(:class="badgeClass") {{ order.state }}
    .detail-overview__id {{ orderNumber }}
  .detail-overview__route
    .detail-overview__point
      .detail-overview__dot
      div
        .detail-overview__route-label Origin
        .detail-overview__route-value {{ order.origin }}
    .detail-overview__line(aria-hidden="true")
      ChevronRight(:size="18", :stroke-width="1.75")
    .detail-overview__point.detail-overview__point--end
      .detail-overview__dot.detail-overview__dot--end
      div
        .detail-overview__route-label Destination
        .detail-overview__route-value {{ order.destination }}
  .detail-overview__info-grid
    div
      .detail-overview__label Delivery date
      .detail-overview__value {{ formattedDeliveryDate }}
    div
      .detail-overview__label Cargo items
      .detail-overview__value {{ order.cargos.length }}
    div
      .detail-overview__label Total weight
      .detail-overview__value {{ totalWeight }} kg
    div(v-if="order.customer")
      .detail-overview__label Customer
      .detail-overview__value {{ customerLabel }}
</template>

<style scoped>
.detail-overview__head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.detail-overview__label {
  font-size: 0.7rem;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
}

.detail-overview__state {
  margin-top: 0.35rem;
}

.detail-overview__id {
  font-family: var(--font-mono);
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  padding: 0.3rem 0.65rem;
  background: var(--color-background-hover);
  border-radius: var(--radius-sm);
}

.detail-overview__route {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 1rem;
  align-items: center;
  padding: 1rem;
  border-radius: var(--radius);
  background: var(--color-background-subtle);
  border: 1px solid var(--color-border);
  margin-bottom: 1.25rem;
}

.detail-overview__point {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
  min-width: 0;
}

.detail-overview__point--end {
  justify-self: end;
  text-align: right;
  flex-direction: row-reverse;
}

.detail-overview__dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--color-primary);
  box-shadow: 0 0 0 4px var(--color-primary-soft);
  margin-top: 6px;
  flex-shrink: 0;
}

.detail-overview__dot--end {
  background: var(--color-info);
  box-shadow: 0 0 0 4px var(--color-info-soft);
}

.detail-overview__route-label {
  font-size: 0.72rem;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
}

.detail-overview__route-value {
  margin-top: 0.2rem;
  font-weight: 500;
  color: var(--color-heading);
  word-break: break-word;
}

.detail-overview__line {
  color: var(--color-text-muted);
}

.detail-overview__info-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
}

.detail-overview__value {
  margin-top: 0.25rem;
  font-weight: 500;
  color: var(--color-heading);
}

@media (max-width: 720px) {
  .detail-overview__route {
    grid-template-columns: 1fr;
  }

  .detail-overview__line {
    display: none;
  }

  .detail-overview__point--end {
    justify-self: start;
    text-align: left;
    flex-direction: row;
  }

  .detail-overview__info-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
