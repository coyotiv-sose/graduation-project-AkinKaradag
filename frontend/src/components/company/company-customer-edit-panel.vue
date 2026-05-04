<script>
import { mapActions } from 'pinia'
import { useCustomerStore } from '@/stores/customer-store'
import { Plus, Trash2 } from 'lucide-vue-next'

const emptyBillingItem = () => ({
  label: 'default',
  customerName: '',
  address: '',
  postalCode: '',
  city: '',
  VATnr: '',
  isDefault: false,
})

export default {
  name: 'CompanyCustomerEditPanel',
  components: { Plus, Trash2 },
  props: {
    companies: {
      type: Array,
      default: () => [],
    },
    companyId: {
      type: String,
      required: true,
    },
    customer: {
      type: Object,
      required: true,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      customerForm: this.buildCustomerForm(this.customer),
      error: null,
    }
  },
  watch: {
    customer: {
      immediate: true,
      handler(customer) {
        this.customerForm = this.buildCustomerForm(customer)
        this.error = null
      },
    },
  },
  methods: {
    ...mapActions(useCustomerStore, {
      updateCustomer: 'updateCustomer',
    }),
    buildCustomerForm(customer) {
      return {
        customerName: customer?.customerName || '',
        email: customer?.account?.email || '',
        company: customer?.company?._id || customer?.company || this.companyId,
        profile: customer?.profile || 'CUSTOMER_DEFAULT',
        billingInfo: (customer?.billingInfo || []).map(item => ({
          label: item.label || 'default',
          customerName: item.customerName || '',
          address: item.address || '',
          postalCode: item.postalCode || '',
          city: item.city || '',
          VATnr: item.VATnr || '',
          isDefault: !!item.isDefault,
        })),
      }
    },
    addBillingItem() {
      this.customerForm.billingInfo.push(emptyBillingItem())
    },
    removeBillingItem(index) {
      this.customerForm.billingInfo.splice(index, 1)
    },
    setDefaultBillingItem(index) {
      this.customerForm.billingInfo = this.customerForm.billingInfo.map((item, itemIndex) => ({
        ...item,
        isDefault: itemIndex === index,
      }))
    },
    async submitCustomer() {
      try {
        this.error = null
        await this.updateCustomer(this.companyId, this.customer._id, this.customerForm)
        this.$emit('saved')
      } catch (err) {
        this.error = err.response?.data?.error || err.message
      }
    },
  },
}
</script>

<template lang="pug">
.customer-edit-panel
  div.kl-alert.kl-alert--danger.form-alert(v-if="error") {{ error }}
  form(@submit.prevent="submitCustomer")
    .kl-form-row
      .kl-field
        label.kl-label Name
        input.kl-input(v-model="customerForm.customerName", required)
      .kl-field
        label.kl-label Email
        input.kl-input(v-model="customerForm.email", type="email", required)
    .kl-form-row.form-gap-top
      .kl-field(v-if="isAdmin")
        label.kl-label Company
        select.kl-select(v-model="customerForm.company", required)
          option(v-for="company in companies", :key="company._id", :value="company._id") {{ company.companyName }}
      .kl-field
        label.kl-label Profile
        input.kl-input(v-model="customerForm.profile")
    .billing-head
      h4 Billing info
      button.kl-btn.kl-btn--outline.kl-btn--sm(type="button", @click="addBillingItem")
        Plus(:size="14", :stroke-width="2")
        | Add billing
    div.billing-card(v-for="(item, index) in customerForm.billingInfo", :key="index")
      .kl-form-row
        .kl-field
          label.kl-label Label
          input.kl-input(v-model="item.label")
        .kl-field
          label.kl-label Billing name
          input.kl-input(v-model="item.customerName", required)
      .kl-form-row.form-gap-top
        .kl-field
          label.kl-label Address
          input.kl-input(v-model="item.address", required)
      .kl-form-row.billing-grid
        .kl-field
          label.kl-label Postal code
          input.kl-input(v-model="item.postalCode", required)
        .kl-field
          label.kl-label City
          input.kl-input(v-model="item.city", required)
        .kl-field
          label.kl-label VAT nr
          input.kl-input(v-model="item.VATnr")
      .billing-actions
        button.kl-btn.kl-btn--outline.kl-btn--sm(type="button", :disabled="item.isDefault", @click="setDefaultBillingItem(index)") {{ item.isDefault ? 'Default' : 'Set as default' }}
        button.kl-btn.kl-btn--ghost.kl-btn--sm.danger-icon(type="button", @click="removeBillingItem(index)")
          Trash2(:size="14", :stroke-width="1.75")
          | Remove
    .customer-edit-panel__actions
      button.kl-btn.kl-btn--primary(type="submit") Save
      button.kl-btn.kl-btn--ghost(type="button", @click="$emit('cancel')") Cancel
</template>

<style scoped>
.customer-edit-panel {
  margin-top: 0.85rem;
  padding: 1rem;
  background: var(--color-background-subtle);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
}

.form-alert {
  margin-bottom: 1rem;
}

.form-gap-top {
  margin-top: 0.85rem;
}

.billing-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
}

.billing-head h4 {
  margin: 0;
  font-size: 0.95rem;
}

.billing-card {
  padding: 0.85rem;
  background: var(--color-background-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  margin-bottom: 0.75rem;
}

.billing-grid {
  --cols: 1fr 1fr 1fr;
  margin-top: 0.85rem;
}

.billing-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-top: 0.85rem;
}

.customer-edit-panel__actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

@media (max-width: 720px) {
  .billing-actions {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
