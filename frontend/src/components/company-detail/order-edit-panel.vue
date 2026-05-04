<script>
export default {
  name: 'OrderEditPanel',
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
        label.kl-label Origin
        input.kl-input(
          :value="form.origin"
          required
          @input="updateField('origin', $event.target.value)"
        )
      .kl-field
        label.kl-label Destination
        input.kl-input(
          :value="form.destination"
          required
          @input="updateField('destination', $event.target.value)"
        )
    .kl-form-row.order-edit__row
      .kl-field
        label.kl-label Delivery date
        input.kl-input(
          :value="form.deliveryDate"
          type="date"
          required
          @input="updateField('deliveryDate', $event.target.value)"
        )
      .kl-field
        label.kl-label Status
        select.kl-select(
          :value="form.state"
          @change="updateField('state', $event.target.value)"
        )
          option(value="PENDING") PENDING
          option(value="IN_PROCESS") IN_PROCESS
          option(value="DELIVERED") DELIVERED
    .inline-panel__actions
      button.kl-btn.kl-btn--primary(type="submit") Save
      button.kl-btn.kl-btn--ghost(type="button", @click="$emit('cancel')") Cancel
</template>

<style scoped src="./company-detail-shared.css"></style>
<style scoped>
.order-edit__row {
  margin-top: 0.85rem;
}
</style>
