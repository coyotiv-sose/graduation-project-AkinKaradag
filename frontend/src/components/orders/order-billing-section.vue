<script>
import { Receipt } from 'lucide-vue-next'
import { billingLabel } from '@/utils/order-form-helpers'

export default {
  name: 'OrderBillingSection',
  components: { Receipt },
  props: {
    selectedId: { type: String, default: '' },
    override: { type: Boolean, default: false },
    custom: { type: Object, required: true },
    profiles: { type: Array, default: () => [] },
    isStaffMode: { type: Boolean, default: false },
  },
  emits: ['update:selectedId', 'update:override', 'update:custom'],
  computed: {
    selectedProfile() {
      return this.profiles.find(b => b._id === this.selectedId) || null
    },
    showProfilePicker() {
      return !this.override && this.profiles.length > 1
    },
    showProfilePreview() {
      return !this.override && !!this.selectedProfile
    },
    showNoProfilesAlert() {
      return !this.override && !this.profiles.length
    },
  },
  methods: {
    billingLabel,
    updateCustomField(key, value) {
      this.$emit('update:custom', { ...this.custom, [key]: value })
    },
  },
}
</script>

<template lang="pug">
section.kl-card.kl-card--padded.kl-form-section
  header.kl-section-head
    .kl-section-icon.kl-section-icon--warning
      Receipt(:size="16", :stroke-width="1.75")
    div
      h3 Billing address
      p.kl-muted Who gets invoiced for this order?

  .kl-form-row(v-if="showProfilePicker" style="--cols: 1")
    .kl-field
      label.kl-label Billing profile
      select.kl-select(
        :value="selectedId"
        @change="$emit('update:selectedId', $event.target.value)"
      )
        option(
          v-for="billing in profiles"
          :key="billing._id"
          :value="billing._id"
        ) {{ billingLabel(billing) }}

  .billing-preview(v-if="showProfilePreview")
    .billing-preview__name {{ selectedProfile.customerName }}
    .billing-preview__line {{ selectedProfile.address }}
    .billing-preview__line {{ selectedProfile.postalCode }} {{ selectedProfile.city }}
    .billing-preview__meta(v-if="selectedProfile.VATnr")
      | VAT: {{ selectedProfile.VATnr }}

  p.kl-alert.kl-alert--warning(v-if="showNoProfilesAlert")
    template(v-if="isStaffMode")
      | This customer has no billing profile yet. Enable "Bill a different party" below to enter one manually.
    template(v-else)
      | You have no billing address on file. Please add one to your profile before creating an order.

  .override-toggle(v-if="isStaffMode")
    label.kl-checkbox
      input(
        type="checkbox"
        :checked="override"
        @change="$emit('update:override', $event.target.checked)"
      )
      span Bill a different party (one-off override)

  template(v-if="override")
    .kl-form-row(style="--cols: 1")
      .kl-field
        label.kl-label Billed party
        input.kl-input(
          :value="custom.customerName"
          @input="updateCustomField('customerName', $event.target.value)"
          placeholder="Company or person to invoice"
          required
        )
    .kl-form-row(style="--cols: 1")
      .kl-field
        label.kl-label Address
        input.kl-input(
          :value="custom.address"
          @input="updateCustomField('address', $event.target.value)"
          placeholder="Street and number"
          required
        )
    .kl-form-row(style="--cols: 120px 1fr")
      .kl-field
        label.kl-label Postal
        input.kl-input(
          :value="custom.postalCode"
          @input="updateCustomField('postalCode', $event.target.value)"
          placeholder="4000"
          required
        )
      .kl-field
        label.kl-label City
        input.kl-input(
          :value="custom.city"
          @input="updateCustomField('city', $event.target.value)"
          placeholder="Basel"
          required
        )
    .kl-form-row(style="--cols: 1fr 1fr")
      .kl-field
        label.kl-label Label (optional)
        input.kl-input(
          :value="custom.label"
          @input="updateCustomField('label', $event.target.value)"
          placeholder="e.g. Third-party billing"
        )
      .kl-field
        label.kl-label VAT nr (optional)
        input.kl-input(
          :value="custom.VATnr"
          @input="updateCustomField('VATnr', $event.target.value)"
          placeholder="CHE-123.456.789"
        )
</template>

<style scoped>
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
</style>
