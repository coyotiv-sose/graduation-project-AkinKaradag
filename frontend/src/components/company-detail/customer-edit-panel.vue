<script>
import BillingInfoEditor from './billing-info-editor.vue'

export default {
  name: 'CustomerEditPanel',
  components: { BillingInfoEditor },
  props: {
    form: { type: Object, required: true },
    companies: { type: Array, default: () => [] },
    isAdmin: { type: Boolean, default: false },
  },
  emits: ['update-form', 'submit', 'cancel'],
  methods: {
    updateField(key, value) {
      this.$emit('update-form', { ...this.form, [key]: value })
    },
  },
}
</script>

<template lang="pug">
.inline-panel
  form(@submit.prevent="$emit('submit')")
    .kl-form-row
      .kl-field
        label.kl-label Name
        input.kl-input(
          :value="form.customerName"
          required
          @input="updateField('customerName', $event.target.value)"
        )
      .kl-field
        label.kl-label Email
        input.kl-input(
          :value="form.email"
          type="email"
          required
          @input="updateField('email', $event.target.value)"
        )
    .kl-form-row.customer-edit__row
      .kl-field(v-if="isAdmin")
        label.kl-label Company
        select.kl-select(
          :value="form.company"
          required
          @change="updateField('company', $event.target.value)"
        )
          option(v-for="company in companies", :key="company._id", :value="company._id") {{ company.companyName }}
      .kl-field
        label.kl-label Profile
        input.kl-input(
          :value="form.profile"
          @input="updateField('profile', $event.target.value)"
        )
    BillingInfoEditor(
      :items="form.billingInfo || []"
      @update-items="updateField('billingInfo', $event)"
    )
    .inline-panel__actions
      button.kl-btn.kl-btn--primary(type="submit") Save
      button.kl-btn.kl-btn--ghost(type="button", @click="$emit('cancel')") Cancel
</template>

<style scoped src="./company-detail-shared.css"></style>
<style scoped>
.customer-edit__row {
  margin-top: 0.85rem;
}
</style>
