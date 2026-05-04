<script>
import { mapActions } from 'pinia'
import { useAdminStore } from '@/stores/admin-store'
import { orderBadgeClass } from '@/utils/badge-classes'
import { formatDate } from '@/utils/format'
import { ChevronRight, Pencil, Trash2 } from 'lucide-vue-next'

const emptyOrderForm = () => ({
  origin: '',
  destination: '',
  state: 'PENDING',
  deliveryDate: '',
})

export default {
  name: 'CompanyOrdersPanel',
  components: { ChevronRight, Pencil, Trash2 },
  props: {
    companyOrders: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      editingOrderId: null,
      orderForm: emptyOrderForm(),
      error: null,
      success: null,
    }
  },
  methods: {
    ...mapActions(useAdminStore, {
      updateOrder: 'updateOrder',
      deleteOrder: 'deleteOrder',
    }),
    clearMessages() {
      this.error = null
      this.success = null
    },
    openEditOrder(order) {
      this.clearMessages()
      this.editingOrderId = order._id
      this.orderForm = {
        origin: order.origin || '',
        destination: order.destination || '',
        state: order.state || 'PENDING',
        deliveryDate: order.deliveryDate ? order.deliveryDate.substring(0, 10) : '',
      }
    },
    cancelEditOrder() {
      this.editingOrderId = null
      this.orderForm = emptyOrderForm()
      this.clearMessages()
    },
    async submitOrder() {
      try {
        this.clearMessages()
        await this.updateOrder(this.editingOrderId, this.orderForm)
        this.editingOrderId = null
        this.orderForm = emptyOrderForm()
        this.success = 'Order updated'
      } catch (err) {
        this.error = err.response?.data?.error || err.message
      }
    },
    async removeOrder(orderId) {
      if (!confirm('Are you sure you want to delete this order?')) return
      try {
        this.clearMessages()
        await this.deleteOrder(orderId)
        this.success = 'Order deleted'
      } catch (err) {
        this.error = err.response?.data?.error || err.message
      }
    },
    formatDate,
    orderBadgeClass,
  },
}
</script>

<template lang="pug">
section.kl-card.kl-card--flush
  .kl-card-header
    div
      h2 Orders
      p.kl-muted.section-sub All transport orders for this company.
    span.kl-badge.kl-badge--muted {{ companyOrders.length }}
  div.kl-alert.kl-alert--danger.panel-alert(v-if="error") {{ error }}
  div.kl-alert.kl-alert--success.panel-alert(v-if="success") {{ success }}
  ul.list(v-if="companyOrders.length")
    li.list-item(v-for="order in companyOrders", :key="order._id")
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
          button.kl-btn.kl-btn--ghost.kl-btn--sm(title="Edit", @click="openEditOrder(order)")
            Pencil(:size="14", :stroke-width="1.75")
          button.kl-btn.kl-btn--ghost.kl-btn--sm.danger-icon(title="Delete", @click="removeOrder(order._id)")
            Trash2(:size="14", :stroke-width="1.75")
      .inline-panel(v-if="editingOrderId === order._id")
        form(@submit.prevent="submitOrder")
          .kl-form-row
            .kl-field
              label.kl-label Origin
              input.kl-input(v-model="orderForm.origin", required)
            .kl-field
              label.kl-label Destination
              input.kl-input(v-model="orderForm.destination", required)
          .kl-form-row.form-gap-top
            .kl-field
              label.kl-label Delivery date
              input.kl-input(v-model="orderForm.deliveryDate", type="date", required)
            .kl-field
              label.kl-label Status
              select.kl-select(v-model="orderForm.state")
                option(value="PENDING") PENDING
                option(value="IN_PROCESS") IN_PROCESS
                option(value="DELIVERED") DELIVERED
          .inline-panel__actions
            button.kl-btn.kl-btn--primary(type="submit") Save
            button.kl-btn.kl-btn--ghost(type="button", @click="cancelEditOrder") Cancel
  div.list__empty(v-else) No orders for this company yet.
</template>

<style scoped>
.panel-alert {
  margin: 0 1.25rem 1rem;
}

.list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.list-item {
  border-bottom: 1px solid var(--color-border);
  padding: 0.85rem 1.25rem;
}

.list-item:last-child {
  border-bottom: none;
}

.list-item__main {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.list-item__actions {
  display: flex;
  gap: 0.25rem;
}

.order-main__route {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  flex: 1;
  min-width: 0;
}

.order-main__arrow {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  color: var(--color-heading);
  font-weight: 500;
  flex-wrap: wrap;
}

.order-main__meta {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  display: flex;
  gap: 0.35rem;
  align-items: center;
  flex-wrap: wrap;
}

.inline-panel {
  margin-top: 0.85rem;
  padding: 1rem;
  background: var(--color-background-subtle);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
}

.inline-panel__actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.form-gap-top {
  margin-top: 0.85rem;
}

.list__empty {
  padding: 1.5rem 1.25rem;
  text-align: center;
  color: var(--color-text-secondary);
  font-style: italic;
}
</style>
