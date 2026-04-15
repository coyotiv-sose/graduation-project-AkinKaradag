<script>
import { mapState, mapActions } from 'pinia'
import { useOrderStore } from '@/stores/order-store'
import { useAccountStore } from '@/stores/account-store'

export default {
  name: 'OrderCreateView',
  data() {
    return {
      origin: {
        name: '',
        street: '',
        number: '',
        postalCode: '',
        city: '',
      },
      destination: {
        name: '',
        street: '',
        number: '',
        postalCode: '',
        city: '',
      },
      deliveryDate: '',
      note: '',
      cargos: [
        { loadCarrierType: 'Pallet', quantity: 1, weight: 0, dimensions: { width: 0, length: 0, height: 0 } },
      ],
      errorMessage: '',
      successMessage: '',
      isSubmitting: false,
      prompt: '',
      isGenerating: false,
      generatedOrder: null,
      aiError: '',
    }
  },
  computed: {
    ...mapState(useAccountStore, ['customerId', 'profile']),
    addressesComplete() {
      const filled = obj => Object.values(obj).every(v => v.trim())
      return filled(this.origin) && filled(this.destination) && !!this.deliveryDate
    },
  },
  methods: {
    ...mapActions(useOrderStore, ['createOrderForCustomer', 'generateOrderFromPrompt']),
    formatAddress(addr) {
      return `${addr.name}, ${addr.street} ${addr.number}, ${addr.postalCode} ${addr.city}`
    },
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

      if (!this.customerId) {
        this.errorMessage = 'Profile not loaded'
        return
      }

      const billingInfo = this.profile?.billingInfo?.find(b => b.isDefault) || this.profile?.billingInfo?.[0]

      if (!billingInfo) {
        this.errorMessage = 'No billing info found on your account'
        return
      }

      this.isSubmitting = true
      try {
        await this.createOrderForCustomer(this.customerId, {
          origin: this.formatAddress(this.origin),
          destination: this.formatAddress(this.destination),
          deliveryDate: this.deliveryDate,
          cargos: this.cargos,
          billingInfo,
        })
        this.successMessage = 'Order created successfully!'
        this.origin = { name: '', street: '', number: '', postalCode: '', city: '' }
        this.destination = { name: '', street: '', number: '', postalCode: '', city: '' }
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
    async generateOrder() {
      if (!this.customerId) {
        this.aiError = 'Profile not loaded'
        return
      }
      if (!this.prompt.trim()) {
        this.aiError = 'Please enter a prompt'
        return
      }

      this.isGenerating = true
      this.aiError = ''
      this.generatedOrder = null

      try {
        const order = await this.generateOrderFromPrompt(
          this.customerId,
          this.prompt,
        )
        this.generatedOrder = order
        this.prompt = ''
      } catch (e) {
        this.aiError = e.response?.data?.error || e.message || 'Failed to generate order'
      } finally {
        this.isGenerating = false
      }
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString()
    },
  },
}
</script>

<template lang="pug">
main
  h1 New Order

  form.order-form(@submit.prevent="submitOrder")
    //- Origin Address
    h3.section-title Origin (Sender)
    .address-block
      .row.g-3
        .col-12
          label.form-label Name
          input.form-control(v-model="origin.name" placeholder="Company or person name" required)
      .row.g-3.mt-1
        .col
          label.form-label Street
          input.form-control(v-model="origin.street" placeholder="Street name" required)
        .col-auto.col-number
          label.form-label Nr.
          input.form-control(v-model="origin.number" placeholder="12a" required)
      .row.g-3.mt-1
        .col-auto.col-postal
          label.form-label Postal Code
          input.form-control(v-model="origin.postalCode" placeholder="4000" required)
        .col
          label.form-label City
          input.form-control(v-model="origin.city" placeholder="Basel" required)

    //- Destination Address
    h3.section-title Destination (Receiver)
    .address-block
      .row.g-3
        .col-12
          label.form-label Name
          input.form-control(v-model="destination.name" placeholder="Company or person name" required)
      .row.g-3.mt-1
        .col
          label.form-label Street
          input.form-control(v-model="destination.street" placeholder="Street name" required)
        .col-auto.col-number
          label.form-label Nr.
          input.form-control(v-model="destination.number" placeholder="5" required)
      .row.g-3.mt-1
        .col-auto.col-postal
          label.form-label Postal Code
          input.form-control(v-model="destination.postalCode" placeholder="5000" required)
        .col
          label.form-label City
          input.form-control(v-model="destination.city" placeholder="Aarau" required)

    //- Delivery Date
    .row.g-3.mt-3
      .col-auto
        label.form-label Delivery Date
        input.form-control(v-model="deliveryDate" type="date" required)

    //- Cargo Details (activated only when addresses + date are filled)
    .cargo-section(:class="{ disabled: !addressesComplete }")
      h3 Cargo Details
      p.hint(v-if="!addressesComplete") Fill in all address fields and the delivery date to add cargo details.

      template(v-if="addressesComplete")
        .cargo-entry(v-for="(cargo, index) in cargos" :key="index")
          .cargo-header-row
            span Cargo {{ index + 1 }}
            button.btn-remove(v-if="cargos.length > 1" type="button" @click="removeCargo(index)") ×

          .row.g-3
            .col-auto
              label.form-label Type
              select.form-select(v-model="cargo.loadCarrierType")
                option Pallet
                option Box
                option Container
                option Envelope
                option Other
            .col-auto
              label.form-label Quantity
              input.form-control(v-model.number="cargo.quantity" type="number" min="1" required)
            .col-auto
              label.form-label Weight (kg)
              input.form-control(v-model.number="cargo.weight" type="number" min="0" required)

          .row.g-3.mt-1
            .col-auto
              label.form-label Width (cm)
              input.form-control(v-model.number="cargo.dimensions.width" type="number" min="0")
            .col-auto
              label.form-label Length (cm)
              input.form-control(v-model.number="cargo.dimensions.length" type="number" min="0")
            .col-auto
              label.form-label Height (cm)
              input.form-control(v-model.number="cargo.dimensions.height" type="number" min="0")

        button.btn.btn-secondary.mt-3(type="button" @click="addCargo") + Add Cargo

    .row.g-3.mt-2
      .col-12
        label.form-label Note (optional)
        textarea.form-control(v-model="note" placeholder="Additional notes..." rows="3")

    p.error(v-if="errorMessage") {{ errorMessage }}
    p.success(v-if="successMessage") {{ successMessage }}

    button.btn.btn-success.w-100.mt-3(type="submit" :disabled="isSubmitting || !addressesComplete")
      | {{ isSubmitting ? 'Creating...' : 'Submit Order' }}

  //- AI Order Generator section
  section.ai-section
    h2 Or create with AI
    textarea.form-control(
      v-model="prompt"
      placeholder='e.g. "Ship 3 pallets of electronics from Berlin to Munich by next Friday, each pallet weighs about 200kg"'
      rows="4"
      :disabled="isGenerating"
    )
    button.btn.btn-success.w-100.mt-2(@click="generateOrder" :disabled="isGenerating || !prompt.trim()")
      | {{ isGenerating ? 'Generating...' : 'Create Order with AI' }}
    p.error(v-if="aiError") {{ aiError }}

    .order-card(v-if="generatedOrder")
      h3 Order Created
      p #[strong Origin:] {{ generatedOrder.origin }}
      p #[strong Destination:] {{ generatedOrder.destination }}
      p #[strong Delivery Date:] {{ formatDate(generatedOrder.deliveryDate) }}
      p #[strong Status:] {{ generatedOrder.state }}
      h4 Cargos
      .cargo(v-for="(cargo, index) in generatedOrder.cargos" :key="index")
        p {{ cargo.quantity }}x {{ cargo.loadCarrierType }} — {{ cargo.weight }}kg
        p.dims {{ cargo.dimensions.width }}×{{ cargo.dimensions.length }}×{{ cargo.dimensions.height }} cm
</template>

<style scoped>
main {
  max-width: 700px;
  margin: 0 auto;
  padding: 2rem;
}

h1 {
  margin-bottom: 1.5rem;
}

.order-form {
  background: var(--color-background-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
}

.section-title {
  margin: 1.5rem 0 0.5rem;
  font-size: 1.1rem;
  font-weight: 600;
}

.section-title:first-of-type {
  margin-top: 0;
}

.address-block {
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-left: 3px solid var(--color-primary);
  border-radius: var(--radius);
  padding: 1rem;
  margin-bottom: 0.5rem;
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

.col-number {
  max-width: 90px;
  min-width: 70px;
}

.col-postal {
  max-width: 120px;
  min-width: 100px;
}

h3 {
  margin: 1.5rem 0 0.75rem;
}

/* Cargo section disabled state */
.cargo-section {
  transition: opacity 0.3s ease;
}

.cargo-section.disabled {
  opacity: 0.5;
  pointer-events: none;
}

.cargo-section.disabled h3 {
  color: var(--color-text-secondary);
}

.hint {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  font-style: italic;
  margin-bottom: 0.5rem;
}

.cargo-entry {
  background: var(--color-background-card);
  border: 1px solid var(--color-border);
  border-left: 3px solid var(--color-primary);
  border-radius: var(--radius);
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

.success {
  color: var(--color-primary);
  margin: 0.5rem 0;
}

.ai-section {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid var(--color-border);
}

.ai-section .order-card {
  background: var(--color-background-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 1rem;
  margin-top: 1rem;
}

.ai-section .cargo {
  padding-left: 1rem;
  border-left: 3px solid var(--color-primary);
  margin: 0.5rem 0;
}

.dims {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
}
</style>
