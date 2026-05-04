<script>
import { createEmptyCompanyForm, companyFormFromCompany } from '@/utils/admin-company-helpers'

export default {
  name: 'AdminCompanyForm',
  props: {
    initialCompany: { type: Object, default: null },
    isSubmitting: { type: Boolean, default: false },
  },
  emits: ['submit', 'cancel'],
  data() {
    return {
      formData: this.buildInitialForm(),
    }
  },
  computed: {
    isEditMode() {
      return !!this.initialCompany
    },
  },
  methods: {
    buildInitialForm() {
      return this.initialCompany
        ? companyFormFromCompany(this.initialCompany)
        : createEmptyCompanyForm()
    },
    buildSubmitPayload() {
      const { companyName, address, postalCode, city, ownerName, ownerEmail, ownerPassword } = this.formData
      const base = { companyName, address, postalCode, city }
      if (this.isEditMode) return base
      const hasOwner = ownerName && ownerEmail && ownerPassword
      return hasOwner ? { ...base, ownerName, ownerEmail, ownerPassword } : base
    },
    onSubmit() {
      this.$emit('submit', this.buildSubmitPayload())
    },
    onCancel() {
      this.$emit('cancel')
    },
  },
}
</script>

<template lang="pug">
section.inline-form
  form(@submit.prevent="onSubmit")
    h3.inline-form__title {{ isEditMode ? 'Edit company' : 'New company' }}
    .kl-form-row(style="--cols: 1")
      .kl-field
        label.kl-label Company name
        input.kl-input(v-model="formData.companyName", required)
      .kl-field
        label.kl-label Address
        input.kl-input(v-model="formData.address", required)
    .kl-form-row
      .kl-field
        label.kl-label Postal code
        input.kl-input(v-model="formData.postalCode", required)
      .kl-field
        label.kl-label City
        input.kl-input(v-model="formData.city", required)
    template(v-if="!isEditMode")
      .kl-divider
      p.kl-muted.inline-form__hint Optional: create an initial dispatcher account for this company.
      .kl-form-row(style="--cols: 1")
        .kl-field
          label.kl-label Owner name
          input.kl-input(v-model="formData.ownerName")
      .kl-form-row
        .kl-field
          label.kl-label Owner email
          input.kl-input(v-model="formData.ownerEmail", type="email")
        .kl-field
          label.kl-label Initial password
          input.kl-input(v-model="formData.ownerPassword", type="password", minlength="6")
    .inline-form__actions
      button.kl-btn.kl-btn--primary(type="submit", :disabled="isSubmitting")
        | {{ isEditMode ? 'Save' : 'Create' }}
      button.kl-btn.kl-btn--ghost(type="button", @click="onCancel") Cancel
</template>
