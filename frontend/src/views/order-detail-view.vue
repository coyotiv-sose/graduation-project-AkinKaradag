<script>
import { mapActions } from 'pinia'
import { useOrderStore } from '@/stores/order-store'
import { useSocketStore } from '@/stores/socket-store'
import PageHeader from '@/components/layout/page-header.vue'
import OrderDetailCargoCard from '@/components/orders/order-detail-cargo-card.vue'
import OrderDetailOverviewCard from '@/components/orders/order-detail-overview-card.vue'
import { formatDateInput } from '@/utils/format'
import { formatBillingLine } from '@/utils/order-form-helpers'
import { Pencil } from 'lucide-vue-next'

export default {
  name: 'OrderDetailView',
  components: { OrderDetailCargoCard, OrderDetailOverviewCard, PageHeader, Pencil },
  data() {
    return {
      order: null,
      editing: false,
      editForm: {
        state: '',
        origin: '',
        destination: '',
        deliveryDate: '',
      },
      errorMessage: '',
    }
  },
  computed: {
    orderId() {
      return this.$route.params.orderId
    },
    orderNumber() {
      return this.order ? `#${this.order._id.slice(-5)}` : ''
    },
    billingLine() {
      return formatBillingLine(this.order?.billingInfo)
    },
  },
  methods: {
    ...mapActions(useOrderStore, ['getOrderById', 'updateOrder']),
    ...mapActions(useSocketStore, ['joinOrderRoom', 'leaveOrderRoom', 'getSocket']),
    async loadOrder() {
      try {
        this.order = await this.getOrderById(this.orderId)
      } catch (e) {
        this.errorMessage = e.response?.data?.error || 'Order not found'
      }
    },
    handleOrderUpdate(updatedOrder) {
      if (updatedOrder._id === this.orderId) {
        this.order = updatedOrder
        if (this.editing) {
          this.editing = false
        }
      }
    },
    startEdit() {
      this.editForm = {
        state: this.order.state,
        origin: this.order.origin,
        destination: this.order.destination,
        deliveryDate: formatDateInput(this.order.deliveryDate),
      }
      this.editing = true
    },
    cancelEdit() {
      this.editing = false
      this.errorMessage = ''
    },
    async saveEdit() {
      this.errorMessage = ''
      try {
        await this.updateOrder(this.orderId, this.editForm)
        await this.loadOrder()
        this.editing = false
      } catch (e) {
        this.errorMessage = e.response?.data?.error || e.message
      }
    },
  },
  async mounted() {
    await this.loadOrder()
    this.joinOrderRoom(this.orderId)
    const socket = this.getSocket()
    if (socket) {
      socket.on('order:updated', this.handleOrderUpdate)
    }
  },
  beforeUnmount() {
    this.leaveOrderRoom(this.orderId)
    const socket = this.getSocket()
    if (socket) {
      socket.off('order:updated', this.handleOrderUpdate)
    }
  },
}
</script>


<template lang="pug">
.order-detail
  PageHeader(
    :title="order ? `Order ${orderNumber}` : 'Order'"
    subtitle="Live transport order details."
    back-to="/orders"
    back-label="Back to orders"
  )
    template(v-if="order && !editing && order.state === 'PENDING'" #actions)
      button.kl-btn.kl-btn--outline(type="button" @click="startEdit")
        Pencil(:size="14", :stroke-width="1.75")
        |  Edit order
  div.kl-alert.kl-alert--danger(v-if="errorMessage") {{ errorMessage }}
  template(v-if="order")
    .detail-grid
      OrderDetailOverviewCard(:order="order")
      OrderDetailCargoCard(:cargos="order.cargos")
      //- Billing
      section.kl-card.kl-card--padded(v-if="order.billingInfo")
        h3.section-h3 Billing info
        p.info-value {{ billingLine }}
      //- Edit form
      section.kl-card.kl-card--padded(v-if="editing")
        h3.section-h3 Edit order
        form.edit-form(@submit.prevent="saveEdit")
          .kl-field
            label.kl-label Origin
            input.kl-input(v-model="editForm.origin")
          .kl-field
            label.kl-label Destination
            input.kl-input(v-model="editForm.destination")
          .kl-form-row
            .kl-field
              label.kl-label Delivery date
              input.kl-input(type="date" v-model="editForm.deliveryDate")
            .kl-field
              label.kl-label Status
              select.kl-select(v-model="editForm.state")
                option(value="PENDING") PENDING
                option(value="IN_PROCESS") IN_PROCESS
                option(value="DELIVERED") DELIVERED
          .edit-form__actions
            button.kl-btn.kl-btn--primary(type="submit") Save changes
            button.kl-btn.kl-btn--ghost(type="button" @click="cancelEdit") Cancel
  p.kl-muted.loading(v-else-if="!errorMessage") Loading order...
</template>

<style scoped>
.order-detail {
  padding-bottom: 3rem;
}

.detail-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.info-value {
  margin-top: 0.25rem;
  font-weight: 500;
  color: var(--color-heading);
}

.section-h3 {
  margin: 0 0 0.85rem;
  font-size: 1rem;
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.edit-form__actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.loading {
  padding: 2rem 0;
  font-style: italic;
}
</style>
