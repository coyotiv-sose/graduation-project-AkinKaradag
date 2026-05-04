<script>
export default {
  name: 'PasswordResetPanel',
  props: {
    password: { type: String, default: '' },
  },
  emits: ['update-password', 'submit', 'cancel'],
}
</script>

<template lang="pug">
.inline-panel
  form.inline-panel__row(@submit.prevent="$emit('submit')")
    .kl-field.flex-grow
      label.kl-label New password
      input.kl-input(
        :value="password"
        type="password"
        required
        minlength="6"
        @input="$emit('update-password', $event.target.value)"
      )
    .inline-panel__actions
      button.kl-btn.kl-btn--primary(type="submit") Save
      button.kl-btn.kl-btn--ghost(type="button", @click="$emit('cancel')") Cancel
</template>

<style scoped src="./company-detail-shared.css"></style>
