<script>
import { useOrderStore } from '@/stores/orderStore'
import { useCustomerStore } from '@/stores/customerStore'
import { useCompanyStore } from '@/stores/companyStore'

export default {
  name: 'CustomerOrderForm',
  data() {
    return {
      selectedCompany: '',
      selectedCustomer: '',
      origin: '',
      destination: '',
      deliveryDate: '',
      note: '',
      cargos: [
        { loadCarrierType: 'Pallet', quantity: 1, weight: 0, dimensions: { width: 0, length: 0, height: 0 } },
      ],
      errorMessage: '',
      successMessage: '',
      isSubmitting: false,
    }
  },
  computed: {
    companies() {
      return useCompanyStore().companies
    },
    customers() {
      return useCustomerStore().customers
    },
    selectedCustomerObj() {
      return this.customers.find(c => c._id === this.selectedCustomer)
    },
  },
  async mounted() {
    await useCompanyStore().getAllCompanies()
  },
  watch: {
    async selectedCompany(companyId) {
      if (companyId) {
        this.selectedCustomer = ''
        await useCustomerStore().getAllCustomers(companyId)
      }
    },
  },
  methods: {
    addCargo() {
      this.cargos.push({
        loadCarrierType: 'Pallet',
        quantity: 1,
        weight: 0,
        dimensions: { width: 0, length: 0, height: 0 },
      })
    },
    removeCargo(index) {
      if (this.cargos.length > 1) {
        this.cargos.splice(index, 1)
      }
    },
    async submitOrder() {
      this.errorMessage = ''
      this.successMessage = ''

      if (!this.selectedCustomer) {
        this.errorMessage = 'Please select a customer'
        return
      }

      const customer = this.selectedCustomerObj
      const billingInfo = customer?.billingInfo?.find(b => b.isDefault) || customer?.billingInfo?.[0]

      if (!billingInfo) {
        this.errorMessage = 'Customer has no billing info'
        return
      }

      this.isSubmitting = true
      try {
        await useOrderStore().createOrderForCustomer(this.selectedCustomer, {
          origin: this.origin,
          destination: this.destination,
          deliveryDate: this.deliveryDate,
          cargos: this.cargos,
          billingInfo,
        })
        this.successMessage = 'Order created successfully!'
        this.origin = ''
        this.destination = ''
        this.deliveryDate = ''
        this.note = ''
        this.cargos = [
          { loadCarrierType: 'Pallet', quantity: 1, weight: 0, dimensions: { width: 0, length: 0, height: 0 } },
        ]
      } catch (e) {
        this.errorMessage = e.response?.data?.error || e.message
      } finally {
        this.isSubmitting = false
      }
    },
  },
}
</script>

<template lang="pug">
main
  h1 New Order

  section.selectors
    label Company
    select(v-model='selectedCompany')
      option(disabled value='') Select a company
      option(v-for='company in companies' :key='company._id' :value='company._id')
        | {{ company.companyName }}

    label Customer
    select(v-model='selectedCustomer' :disabled='!selectedCompany')
      option(disabled value='') Select a customer
      option(v-for='customer in customers' :key='customer._id' :value='customer._id')
        | {{ customer.customerName }}

  form.order-form(@submit.prevent='submitOrder')
    .form-row
      .form-group
        label Sender Address (Origin)
        input(v-model='origin' placeholder='e.g. Basel, Switzerland' required)
      .form-group
        label Receiver Address (Destination)
        input(v-model='destination' placeholder='e.g. Aarau, Switzerland' required)

    .form-row
      .form-group
        label Delivery Date
        input(v-model='deliveryDate' type='date' required)

    h3 Cargo Details
    .cargo-entry(v-for='(cargo, index) in cargos' :key='index')
      .cargo-header-row
        span Cargo {{ index + 1 }}
        button.btn-remove(v-if='cargos.length > 1' type='button' @click='removeCargo(index)') ×

      .form-row
        .form-group
          label Type
          select(v-model='cargo.loadCarrierType')
            option Pallet
            option Box
            option Container
            option Envelope
            option Other
        .form-group
          label Quantity
          input(v-model.number='cargo.quantity' type='number' min='1' required)
        .form-group
          label Weight (kg)
          input(v-model.number='cargo.weight' type='number' min='0' required)

      .form-row
        .form-group
          label Width (cm)
          input(v-model.number='cargo.dimensions.width' type='number' min='0')
        .form-group
          label Length (cm)
          input(v-model.number='cargo.dimensions.length' type='number' min='0')
        .form-group
          label Height (cm)
          input(v-model.number='cargo.dimensions.height' type='number' min='0')

    button.btn-secondary(type='button' @click='addCargo') + Add Cargo

    .form-row
      .form-group.full
        label Note (optional)
        textarea(v-model='note' placeholder='Additional notes...' rows='3')

    p.error(v-if='errorMessage') {{ errorMessage }}
    p.success(v-if='successMessage') {{ successMessage }}

    button.btn-primary(type='submit' :disabled='isSubmitting')
      | {{ isSubmitting ? 'Creating...' : 'Submit Order' }}
</template>

<style scoped>
@import '@/assets/shared.css';

main {
  max-width: 700px;
  margin: 0 auto;
  padding: 2rem;
}

h1 {
  margin-bottom: 1.5rem;
}

.selectors {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.selectors select {
  padding: 0.5rem;
  font-size: 1rem;
}

.order-form {
  background: #f9f9f9;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1.5rem;
}

h3 {
  margin: 1.5rem 0 0.75rem;
}

.cargo-entry {
  background: white;
  border: 1px solid #ddd;
  border-left: 3px solid #2c7a2c;
  border-radius: 6px;
  padding: 1rem;
  margin-bottom: 0.75rem;
}

.cargo-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.cargo-header-row span {
  font-weight: 600;
  font-size: 0.9rem;
}

.btn-remove {
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
  font-size: 1rem;
  line-height: 1;
}

.btn-secondary {
  margin-bottom: 1rem;
}

.btn-primary {
  display: block;
  width: 100%;
  padding: 0.75rem;
  font-size: 1rem;
}

.btn-primary:disabled {
  background: #999;
  cursor: not-allowed;
}

.success {
  color: #155724;
  margin: 0.5rem 0;
}
</style>
