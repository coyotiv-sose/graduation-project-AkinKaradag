<script>
export default {
  name: 'EmployeeEditPanel',
  props: {
    form: { type: Object, required: true },
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
          :value="form.name"
          required
          @input="updateField('name', $event.target.value)"
        )
      .kl-field
        label.kl-label Email
        input.kl-input(
          :value="form.email"
          type="email"
          required
          @input="updateField('email', $event.target.value)"
        )
    .kl-form-row.employee-edit__row(style="--cols: 1")
      .kl-field
        label.kl-label Profile
        input.kl-input(
          :value="form.profile"
          @input="updateField('profile', $event.target.value)"
        )
    .inline-panel__actions
      button.kl-btn.kl-btn--primary(type="submit") Save
      button.kl-btn.kl-btn--ghost(type="button", @click="$emit('cancel')") Cancel
</template>

<style scoped src="./company-detail-shared.css"></style>
<style scoped>
.employee-edit__row {
  margin-top: 0.85rem;
}
</style>
