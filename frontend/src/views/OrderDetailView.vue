<script>
import { useOrderStore } from '@/stores/orderStore'

export default {
  name: 'OrderDetailView',
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
  },
  async mounted() {
    await this.loadOrder()
  },
  methods: {
    async loadOrder() {
      try {
        this.order = await useOrderStore().getOrderById(this.orderId)
      } catch (e) {
        this.errorMessage = e.response?.data?.error || 'Order not found'
      }
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString()
    },
    formatDateInput(date) {
      return new Date(date).toISOString().split('T')[0]
    },
    startEdit() {
      this.editForm = {
        state: this.order.state,
        origin: this.order.origin,
        destination: this.order.destination,
        deliveryDate: this.formatDateInput(this.order.deliveryDate),
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
        await useOrderStore().updateOrder(this.orderId, this.editForm)
        await this.loadOrder()
        this.editing = false
      } catch (e) {
        this.errorMessage = e.response?.data?.error || e.message
      }
    },
  },
}
</script>

<template lang="pug">
main
  button.btn-back(@click='$router.back()') ← Back

  .error(v-if='errorMessage') {{ errorMessage }}

  template(v-if='order')
    .order-detail
      .detail-header
        h1 Order \#{{ order._id.slice(-5) }}
        span.badge(:class='stateClass') {{ order.state }}

      template(v-if='!editing')
        .detail-grid
          .detail-item
            label Origin
            p {{ order.origin }}
          .detail-item
            label Destination
            p {{ order.destination }}
          .detail-item
            label Delivery Date
            p {{ formatDate(order.deliveryDate) }}
          .detail-item
            label Status
            p {{ order.state }}
          .detail-item(v-if='order.customer')
            label Customer
            p {{ order.customer.customerName || order.customer }}

        section.cargos
          h2 Cargos ({{ order.cargos.length }})
          .cargo-card(v-for='(cargo, index) in order.cargos' :key='index')
            .cargo-header {{ cargo.quantity }}x {{ cargo.loadCarrierType }}
            p Weight: {{ cargo.weight }} kg
            p Dimensions: {{ cargo.dimensions.width }}×{{ cargo.dimensions.length }}×{{ cargo.dimensions.height }} cm

        section.billing(v-if='order.billingInfo')
          h2 Billing Info
          p {{ order.billingInfo.customerName }}
          p {{ order.billingInfo.address }}, {{ order.billingInfo.postalCode }} {{ order.billingInfo.city }}

        button.btn-primary(@click='startEdit' v-if='order.state === "PENDING"') Edit Order

      template(v-else)
        form.edit-form(@submit.prevent='saveEdit')
          label Origin
          input(v-model='editForm.origin')
          label Destination
          input(v-model='editForm.destination')
          label Delivery Date
          input(v-model='editForm.deliveryDate' type='date')
          label Status
          select(v-model='editForm.state')
            option(value='PENDING') PENDING
            option(value='IN_PROCESS') IN_PROCESS
            option(value='DELIVERED') DELIVERED
          .form-actions
            button.btn-primary(type='submit') Save
            button(type='button' @click='cancelEdit') Cancel

  p(v-else-if='!errorMessage') Loading order...
</template>

<style scoped>
@import '@/assets/shared.css';

main {
  max-width: 700px;
  margin: 0 auto;
  padding: 2rem;
}

.order-detail {
  background: #f9f9f9;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1.5rem;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.detail-header h1 {
  font-size: 1.5rem;
  margin: 0;
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.detail-item label {
  font-size: 0.8rem;
  color: #888;
  text-transform: uppercase;
  font-weight: 600;
}

.detail-item p {
  margin: 0.25rem 0 0;
  font-size: 1rem;
}

.cargos,
.billing {
  margin-top: 1.5rem;
}

.cargos h2,
.billing h2 {
  font-size: 1.1rem;
  margin-bottom: 0.75rem;
}

.cargo-card {
  background: white;
  border: 1px solid #ddd;
  border-left: 3px solid #2c7a2c;
  border-radius: 6px;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
}

.cargo-card .cargo-header {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.cargo-card p {
  font-size: 0.85rem;
  color: #666;
  margin: 0.1rem 0;
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.edit-form label {
  font-size: 0.85rem;
  font-weight: 600;
  margin-top: 0.5rem;
}

.edit-form input,
.edit-form select {
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 0.95rem;
}

.form-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.form-actions button {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
}

.btn-primary {
  margin-top: 1rem;
}
</style>
