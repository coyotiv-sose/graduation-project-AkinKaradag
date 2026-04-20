<script>
import { mapState, mapActions } from 'pinia'
import { useOrderStore } from '@/stores/order-store'
import { useAccountStore } from '@/stores/account-store'
import { useCustomerStore } from '@/stores/customer-store'
import { useAdminStore } from '@/stores/admin-store'
import PageHeader from '@/components/page-header.vue'
import AddressForm from '@/components/address-form.vue'
import { Plus, Trash2, Sparkles, Package, User, Receipt } from 'lucide-vue-next'
import {
  createEmptyBillingInfo,
  createEmptyAddress,
  createEmptyCargo,
  formatAddress,
  shortAddress,
  customerLabel,
  billingLabel,
  formatDate,
  formatBillingLine,
} from '@/utils/order-form-helpers'

export default {
  name: 'OrderCreateView',
  components: { PageHeader, AddressForm, Plus, Trash2, Sparkles, Package, User, Receipt },
  data() {
    return {
      origin: createEmptyAddress(),
      destination: createEmptyAddress(),
      deliveryDate: '',
      note: '',
      cargos: [createEmptyCargo()],
      errorMessage: '',
      successMessage: '',
      isSubmitting: false,
      prompt: '',
      isGenerating: false,
      generatedOrder: null,
      aiError: '',
      selectedCustomerId: '',
      selectedBillingId: '',
      overrideBilling: false,
      customBillingInfo: createEmptyBillingInfo(),
    }
  },
  computed: {
    ...mapState(useAccountStore, ['customerId', 'profile', 'isCustomer', 'isEmployee', 'isAdmin', 'companyId']),
    ...mapState(useCustomerStore, { companyCustomers: 'customers' }),
    ...mapState(useAdminStore, ['allCustomers']),
    isStaffMode() {
      return this.isEmployee || this.isAdmin
    },
    customerOptions() {
      if (this.isAdmin) return this.allCustomers
      if (this.isEmployee) return this.companyCustomers
      return []
    },
    selectedCustomer() {
      if (!this.selectedCustomerId) return null
      return this.customerOptions.find(c => c._id === this.selectedCustomerId) || null
    },
    billingProfiles() {
      if (this.isStaffMode) return this.selectedCustomer?.billingInfo || []
      return this.profile?.billingInfo || []
    },
    resolvedCustomerId() {
      return this.isStaffMode ? this.selectedCustomerId : this.customerId
    },
    resolvedBillingInfo() {
      if (this.overrideBilling) return this.customBillingInfo
      return this.billingProfiles.find(b => b._id === this.selectedBillingId) || null
    },
    showBillingSection() {
      return this.isCustomer || (this.isStaffMode && !!this.selectedCustomerId)
    },
    addressesComplete() {
      const filled = obj => Object.values(obj).every(v => String(v).trim())
      return filled(this.origin) && filled(this.destination) && !!this.deliveryDate
    },
    customBillingComplete() {
      const b = this.customBillingInfo
      return ['customerName', 'address', 'postalCode', 'city'].every(k => String(b[k]).trim())
    },
    billingReady() {
      if (this.overrideBilling) return this.customBillingComplete
      return !!this.resolvedBillingInfo
    },
    canSubmit() {
      return this.addressesComplete && !!this.resolvedCustomerId && this.billingReady && !this.isSubmitting
    },
    canGenerate() {
      return !!this.resolvedCustomerId && this.billingReady && !!this.prompt.trim() && !this.isGenerating
    },
    totalWeight() {
      return this.cargos.reduce((sum, c) => sum + Number(c.quantity || 0) * Number(c.weight || 0), 0)
    },
    totalUnits() {
      return this.cargos.reduce((sum, c) => sum + Number(c.quantity || 0), 0)
    },
    formattedDeliveryDate() {
      if (!this.deliveryDate) return '—'
      return new Date(this.deliveryDate).toLocaleDateString(undefined, {
        weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
      })
    },
    billingSummaryLine() {
      return formatBillingLine(this.resolvedBillingInfo)
    },
  },
  watch: {
    selectedCustomerId() {
      this.selectedBillingId = this.pickDefaultBillingId(this.billingProfiles)
      this.overrideBilling = false
    },
  },
  async mounted() {
    if (this.isEmployee && this.companyId) {
      await this.loadCompanyCustomers(this.companyId)
    } else if (this.isAdmin) {
      await this.loadAllCustomers()
    } else if (this.isCustomer) {
      this.selectedBillingId = this.pickDefaultBillingId(this.billingProfiles)
    }
  },
  methods: {
    ...mapActions(useOrderStore, ['createOrderForCustomer', 'generateOrderFromPrompt']),
    ...mapActions(useCustomerStore, { loadCompanyCustomers: 'getAllCustomers' }),
    ...mapActions(useAdminStore, { loadAllCustomers: 'getAllCustomers' }),
    shortAddress,
    customerLabel,
    billingLabel,
    formatDate,
    pickDefaultBillingId(profiles) {
      if (!profiles?.length) return ''
      const chosen = profiles.find(b => b.isDefault) || profiles[0]
      return chosen._id || ''
    },
    addCargo() {
      this.cargos.push(createEmptyCargo())
    },
    removeCargo(index) {
      if (this.cargos.length > 1) {
        this.cargos.splice(index, 1)
      }
    },
    resetForm() {
      this.origin = createEmptyAddress()
      this.destination = createEmptyAddress()
      this.deliveryDate = ''
      this.note = ''
      this.cargos = [createEmptyCargo()]
      if (this.isStaffMode) {
        this.selectedCustomerId = ''
      }
      this.overrideBilling = false
      this.customBillingInfo = createEmptyBillingInfo()
    },
    async submitOrder() {
      this.errorMessage = ''
      this.successMessage = ''

      if (!this.resolvedCustomerId) {
        this.errorMessage = this.isStaffMode ? 'Select a customer first' : 'Profile not loaded'
        return
      }
      if (!this.billingReady) {
        this.errorMessage = 'Billing information is incomplete'
        return
      }

      this.isSubmitting = true
      try {
        await this.createOrderForCustomer(this.resolvedCustomerId, {
          origin: formatAddress(this.origin),
          destination: formatAddress(this.destination),
          deliveryDate: this.deliveryDate,
          cargos: this.cargos,
          billingInfo: this.resolvedBillingInfo,
          note: this.note,
        })
        this.successMessage = 'Order created successfully!'
        this.resetForm()
      } catch (e) {
        this.errorMessage = e.response?.data?.error || e.message
      } finally {
        this.isSubmitting = false
      }
    },
    async generateOrder() {
      this.aiError = ''
      if (!this.resolvedCustomerId) {
        this.aiError = this.isStaffMode ? 'Select a customer first' : 'Profile not loaded'
        return
      }
      if (!this.billingReady) {
        this.aiError = 'Billing information is incomplete'
        return
      }
      if (!this.prompt.trim()) {
        this.aiError = 'Please enter a prompt'
        return
      }

      this.isGenerating = true
      this.generatedOrder = null

      try {
        const order = await this.generateOrderFromPrompt(
          this.resolvedCustomerId,
          this.prompt,
          this.resolvedBillingInfo,
        )
        this.generatedOrder = order
        this.prompt = ''
      } catch (e) {
        this.aiError = e.response?.data?.error || e.message || 'Failed to generate order'
      } finally {
        this.isGenerating = false
      }
    },
  },
}
</script>


<template lang="pug">
.order-create
  PageHeader(
    title="Create a transport order"
    subtitle="Enter pickup, delivery and cargo details, or describe the shipment to our AI assistant."
    back-to="/orders"
    back-label="Back to orders"
  )
  .order-create__grid
    //- FORM
    form.form-col(@submit.prevent="submitOrder")
      //- Staff-only: pick the customer this order is for
      section.kl-card.kl-card--padded.form-section(v-if="isStaffMode")
        header.form-section__head
          .form-section__icon
            User(:size="16", :stroke-width="1.75")
          div
            h3 Customer
            p.kl-muted Who is this order being booked for?
        .kl-form-row(style="--cols: 1")
          .kl-field
            label.kl-label Customer
            select.kl-select(v-model="selectedCustomerId" required)
              option(disabled value="") Select a customer
              option(
                v-for="customer in customerOptions"
                :key="customer._id"
                :value="customer._id"
              ) {{ customerLabel(customer) }}
          p.kl-muted.hint(v-if="isStaffMode && !customerOptions.length")
            | No customers found. Add a customer first to create orders on their behalf.

      //- Billing section
      section.kl-card.kl-card--padded.form-section(v-if="showBillingSection")
        header.form-section__head
          .form-section__icon.form-section__icon--billing
            Receipt(:size="16", :stroke-width="1.75")
          div
            h3 Billing address
            p.kl-muted Who gets invoiced for this order?
        template(v-if="!overrideBilling && billingProfiles.length > 1")
          .kl-form-row(style="--cols: 1")
            .kl-field
              label.kl-label Billing profile
              select.kl-select(v-model="selectedBillingId")
                option(
                  v-for="billing in billingProfiles"
                  :key="billing._id"
                  :value="billing._id"
                ) {{ billingLabel(billing) }}
        .billing-preview(v-if="!overrideBilling && resolvedBillingInfo")
          .billing-preview__name {{ resolvedBillingInfo.customerName }}
          .billing-preview__line {{ resolvedBillingInfo.address }}
          .billing-preview__line {{ resolvedBillingInfo.postalCode }} {{ resolvedBillingInfo.city }}
          .billing-preview__meta(v-if="resolvedBillingInfo.VATnr")
            | VAT: {{ resolvedBillingInfo.VATnr }}
        p.kl-alert.kl-alert--warning(v-if="!overrideBilling && !billingProfiles.length")
          template(v-if="isStaffMode")
            | This customer has no billing profile yet. Enable "Bill a different party" below to enter one manually.
          template(v-else)
            | You have no billing address on file. Please add one to your profile before creating an order.
        .override-toggle(v-if="isStaffMode")
          label.kl-checkbox
            input(type="checkbox" v-model="overrideBilling")
            span Bill a different party (one-off override)
        template(v-if="overrideBilling")
          .kl-form-row(style="--cols: 1")
            .kl-field
              label.kl-label Billed party
              input.kl-input(v-model="customBillingInfo.customerName" placeholder="Company or person to invoice" required)
          .kl-form-row(style="--cols: 1")
            .kl-field
              label.kl-label Address
              input.kl-input(v-model="customBillingInfo.address" placeholder="Street and number" required)
          .kl-form-row(style="--cols: 120px 1fr")
            .kl-field
              label.kl-label Postal
              input.kl-input(v-model="customBillingInfo.postalCode" placeholder="4000" required)
            .kl-field
              label.kl-label City
              input.kl-input(v-model="customBillingInfo.city" placeholder="Basel" required)
          .kl-form-row(style="--cols: 1fr 1fr")
            .kl-field
              label.kl-label Label (optional)
              input.kl-input(v-model="customBillingInfo.label" placeholder="e.g. Third-party billing")
            .kl-field
              label.kl-label VAT nr (optional)
              input.kl-input(v-model="customBillingInfo.VATnr" placeholder="CHE-123.456.789")

      AddressForm(
        v-model="origin"
        variant="origin"
        title="Pickup origin"
        subtitle="Where is the shipment being collected from?"
      )

      AddressForm(
        v-model="destination"
        variant="destination"
        title="Delivery destination"
        subtitle="Where is the shipment going?"
      )

      section.kl-card.kl-card--padded.form-section
        header.form-section__head
          .form-section__icon
            Package(:size="16", :stroke-width="1.75")
          div
            h3 Scheduling & cargo
            p.kl-muted Delivery window and shipment contents.
        .kl-form-row(style="--cols: 1fr 1fr")
          .kl-field
            label.kl-label Delivery date
            input.kl-input(type="date" v-model="deliveryDate" required)
        .cargo-section(:class="{ 'cargo-section--disabled': !addressesComplete }")
          p.hint(v-if="!addressesComplete")
            | Fill in all address fields and the delivery date to add cargo details.
          template(v-if="addressesComplete")
            div.cargo-entry(v-for="(cargo, index) in cargos" :key="index")
              .cargo-entry__head
                span Cargo {{ index + 1 }}
                button.kl-btn.kl-btn--ghost.kl-btn--sm.danger-icon(
                  v-if="cargos.length > 1"
                  type="button"
                  title="Remove cargo"
                  @click="removeCargo(index)"
                )
                  Trash2(:size="14", :stroke-width="1.75")
              .kl-form-row(style="--cols: 1fr 1fr 1fr")
                .kl-field
                  label.kl-label Type
                  select.kl-select(v-model="cargo.loadCarrierType")
                    option Pallet
                    option Box
                    option Container
                    option Envelope
                    option Other
                .kl-field
                  label.kl-label Quantity
                  input.kl-input(type="number" v-model.number="cargo.quantity" min="1" required)
                .kl-field
                  label.kl-label Weight (kg)
                  input.kl-input(type="number" v-model.number="cargo.weight" min="0" required)
              .kl-form-row(style="--cols: 1fr 1fr 1fr")
                .kl-field
                  label.kl-label Width (cm)
                  input.kl-input(type="number" v-model.number="cargo.dimensions.width" min="0")
                .kl-field
                  label.kl-label Length (cm)
                  input.kl-input(type="number" v-model.number="cargo.dimensions.length" min="0")
                .kl-field
                  label.kl-label Height (cm)
                  input.kl-input(type="number" v-model.number="cargo.dimensions.height" min="0")
            button.kl-btn.kl-btn--outline(type="button" @click="addCargo")
              Plus(:size="14", :stroke-width="2")
              |  Add another cargo
        .kl-form-row(style="--cols: 1")
          .kl-field
            label.kl-label Note (optional)
            textarea.kl-textarea(v-model="note" rows="3" placeholder="Additional notes...")
      p.kl-alert.kl-alert--danger(v-if="errorMessage") {{ errorMessage }}
      p.kl-alert.kl-alert--success(v-if="successMessage") {{ successMessage }}
      .form-submit
        button.kl-btn.kl-btn--primary.kl-btn--lg(
          type="submit"
          :disabled="!canSubmit"
        )
          | {{ isSubmitting ? 'Creating...' : 'Submit order' }}

    //- SUMMARY
    aside.summary-col
      .kl-card.kl-card--padded.summary
        h3 Order summary
        p.kl-muted.summary__sub Live preview based on your inputs.
        .summary-row(v-if="isStaffMode")
          span.summary-row__label Customer
          span.summary-row__value {{ selectedCustomer ? selectedCustomer.customerName : 'Not selected' }}
        .summary-row
          span.summary-row__label Billing
          span.summary-row__value {{ billingSummaryLine }}
        .summary-row
          span.summary-row__label Origin
          span.summary-row__value {{ shortAddress(origin) }}
        .summary-row
          span.summary-row__label Destination
          span.summary-row__value {{ shortAddress(destination) }}
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
      .kl-card.kl-card--padded.ai-section
        .ai-section__head
          .ai-section__icon
            Sparkles(:size="16", :stroke-width="1.75")
          div
            h3 Create with AI
            p.kl-muted Describe your shipment in plain language.
        p.kl-muted.hint(v-if="isStaffMode && !selectedCustomerId")
          | Select a customer above before generating with AI.
        textarea.kl-textarea(
          v-model="prompt"
          rows="4"
          placeholder='e.g. "Ship 3 pallets of electronics from Berlin to Munich by next Friday, each pallet ~200kg"'
          :disabled="isGenerating || (isStaffMode && !selectedCustomerId)"
        )
        button.kl-btn.kl-btn--primary.kl-btn--block(
          type="button"
          :disabled="!canGenerate"
          @click="generateOrder"
        )
          | {{ isGenerating ? 'Generating...' : 'Create order with AI' }}
        p.kl-alert.kl-alert--danger(v-if="aiError") {{ aiError }}
        div.generated-order(v-if="generatedOrder")
          .generated-order__head
            h4 Order created
            span.kl-badge.kl-badge--primary {{ generatedOrder.state }}
          p
            strong Origin:
            |  {{ generatedOrder.origin }}
          p
            strong Destination:
            |  {{ generatedOrder.destination }}
          p
            strong Delivery:
            |  {{ formatDate(generatedOrder.deliveryDate) }}
          .kl-divider
          h5 Cargos
          div.generated-cargo(v-for="(cargo, idx) in generatedOrder.cargos" :key="idx")
            p {{ cargo.quantity }}x {{ cargo.loadCarrierType }} — {{ cargo.weight }} kg
            p.kl-muted.small
              | {{ cargo.dimensions.width }} × {{ cargo.dimensions.length }} × {{ cargo.dimensions.height }} cm
</template>

<style scoped>
.order-create {
  padding-bottom: 3rem;
}

.order-create__grid {
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr);
  gap: 1.5rem;
  align-items: start;
}

.form-col {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.summary-col {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  position: sticky;
  top: 1.5rem;
}

.form-section__head {
  display: flex;
  gap: 0.85rem;
  align-items: center;
  margin-bottom: 1.25rem;
}

.form-section__icon {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm);
  background: var(--color-primary-soft);
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.form-section__icon--destination {
  background: var(--color-info-soft);
  color: var(--color-info);
}

.form-section__icon--billing {
  background: var(--color-warning-soft, var(--color-primary-soft));
  color: var(--color-warning, var(--color-primary));
}

.form-section__head h3 {
  margin: 0;
  font-size: 1rem;
}

.form-section__head p {
  margin: 0.15rem 0 0;
  font-size: 0.8rem;
}

.form-section + .form-section {
  margin-top: 0;
}

.form-section .kl-form-row + .kl-form-row {
  margin-top: 0.85rem;
}

.billing-preview {
  margin-top: 0.85rem;
  padding: 0.85rem 1rem;
  border: 1px solid var(--color-border);
  border-left: 3px solid var(--color-primary);
  border-radius: var(--radius-sm);
  background: var(--color-background-subtle);
  font-size: 0.875rem;
  line-height: 1.45;
}

.billing-preview__name {
  font-weight: 600;
  color: var(--color-heading);
  margin-bottom: 0.1rem;
}

.billing-preview__line {
  color: var(--color-text);
}

.billing-preview__meta {
  margin-top: 0.35rem;
  font-size: 0.8rem;
  color: var(--color-text-secondary);
}

.override-toggle {
  margin-top: 0.85rem;
}

.kl-checkbox {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--color-text);
  cursor: pointer;
  user-select: none;
}

.kl-checkbox input[type='checkbox'] {
  margin: 0;
  cursor: pointer;
}

.cargo-section {
  margin-top: 1.25rem;
}

.cargo-section--disabled {
  opacity: 0.55;
  pointer-events: none;
}

.hint {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  font-style: italic;
  margin: 0 0 0.75rem;
}

.cargo-entry {
  padding: 1rem;
  border: 1px solid var(--color-border);
  border-left: 3px solid var(--color-primary);
  border-radius: var(--radius-sm);
  margin-bottom: 0.85rem;
  background: var(--color-background-subtle);
}

.cargo-entry__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.85rem;
  font-weight: 600;
  color: var(--color-heading);
}

.danger-icon:hover {
  color: var(--color-danger);
  background: var(--color-danger-soft);
}

.form-submit {
  display: flex;
  justify-content: flex-end;
  padding: 0.5rem 0 1rem;
}

/* Summary */
.summary h3,
.ai-section h3 {
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

/* AI section */
.ai-section {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.ai-section__head {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.ai-section__icon {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm);
  background: var(--color-primary-soft);
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.ai-section__head p {
  margin: 0;
  font-size: 0.8rem;
}

.generated-order {
  padding: 0.85rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-background-subtle);
  font-size: 0.875rem;
}

.generated-order h4 {
  margin: 0;
  font-size: 0.95rem;
}

.generated-order h5 {
  margin: 0 0 0.4rem;
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
}

.generated-order__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.generated-order p {
  margin: 0.2rem 0;
}

.generated-cargo + .generated-cargo {
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px dashed var(--color-border);
}

.generated-cargo .small {
  font-size: 0.8rem;
}

@media (max-width: 1020px) {
  .order-create__grid {
    grid-template-columns: 1fr;
  }
  .summary-col {
    position: static;
  }
}
</style>
