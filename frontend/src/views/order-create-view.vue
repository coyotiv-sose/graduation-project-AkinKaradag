<script>
import { mapState, mapActions } from 'pinia'
import { useOrderStore } from '@/stores/order-store'
import { useAccountStore } from '@/stores/account-store'
import { useCustomerStore } from '@/stores/customer-store'
import { useAdminStore } from '@/stores/admin-store'
import PageHeader from '@/components/layout/page-header.vue'
import AddressForm from '@/components/shared/address-form.vue'
import OrderCustomerPicker from '@/components/orders/order-customer-picker.vue'
import OrderBillingSection from '@/components/orders/order-billing-section.vue'
import OrderCargoSection from '@/components/orders/order-cargo-section.vue'
import OrderSummaryCard from '@/components/orders/order-summary-card.vue'
import OrderAiPrompt from '@/components/orders/order-ai-prompt.vue'
import {
  createEmptyBillingInfo,
  createEmptyAddress,
  createEmptyCargo,
  formatAddress,
} from '@/utils/order-form-helpers'

export default {
  name: 'OrderCreateView',
  components: {
    PageHeader,
    AddressForm,
    OrderCustomerPicker,
    OrderBillingSection,
    OrderCargoSection,
    OrderSummaryCard,
    OrderAiPrompt,
  },
  data() {
    return {
      origin: createEmptyAddress(),
      destination: createEmptyAddress(),
      deliveryDate: '',
      note: '',
      cargos: [createEmptyCargo()],
      selectedCustomerId: '',
      selectedBillingId: '',
      overrideBilling: false,
      customBillingInfo: createEmptyBillingInfo(),
      errorMessage: '',
      successMessage: '',
      isSubmitting: false,
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
    needsCustomerForAi() {
      return this.isStaffMode && !this.selectedCustomerId
    },
    aiBillingInfo() {
      return this.billingReady ? this.resolvedBillingInfo : null
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
    ...mapActions(useOrderStore, ['createOrderForCustomer']),
    ...mapActions(useCustomerStore, { loadCompanyCustomers: 'getAllCustomers' }),
    ...mapActions(useAdminStore, { loadAllCustomers: 'getAllCustomers' }),
    pickDefaultBillingId(profiles) {
      if (!profiles?.length) return ''
      const chosen = profiles.find(b => b.isDefault) || profiles[0]
      return chosen._id || ''
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
    form.form-col(@submit.prevent="submitOrder")
      OrderCustomerPicker(
        v-if="isStaffMode"
        v-model="selectedCustomerId"
        :customers="customerOptions"
      )

      OrderBillingSection(
        v-if="showBillingSection"
        v-model:selected-id="selectedBillingId"
        v-model:override="overrideBilling"
        v-model:custom="customBillingInfo"
        :profiles="billingProfiles"
        :is-staff-mode="isStaffMode"
      )

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

      OrderCargoSection(
        v-model:cargos="cargos"
        v-model:delivery-date="deliveryDate"
        v-model:note="note"
        :enabled="addressesComplete"
      )

      p.kl-alert.kl-alert--danger(v-if="errorMessage") {{ errorMessage }}
      p.kl-alert.kl-alert--success(v-if="successMessage") {{ successMessage }}
      .form-submit
        button.kl-btn.kl-btn--primary.kl-btn--lg(
          type="submit"
          :disabled="!canSubmit"
        )
          | {{ isSubmitting ? 'Creating...' : 'Submit order' }}

    aside.summary-col
      OrderSummaryCard(
        :customer="selectedCustomer"
        :billing-info="resolvedBillingInfo"
        :origin="origin"
        :destination="destination"
        :delivery-date="deliveryDate"
        :cargos="cargos"
        :show-customer="isStaffMode"
      )
      OrderAiPrompt(
        :customer-id="resolvedCustomerId"
        :billing-info="aiBillingInfo"
        :is-staff-mode="isStaffMode"
        :needs-customer-hint="needsCustomerForAi"
      )
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

.form-submit {
  display: flex;
  justify-content: flex-end;
  padding: 0.5rem 0 1rem;
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
