<script>
import { apiErrorMessage } from '@/utils/error-helpers'

export default {
  name: 'CreateFormWrapper',
  props: {
    submitLabel: {
      type: String,
      default: 'Create',
    },
    onSubmit: {
      type: Function,
      required: true,
    },
  },
  data() {
    return {
      isLoading: false,
      errorMessage: '',
    }
  },
  methods: {
    async handleSubmit() {
      this.isLoading = true
      this.errorMessage = ''
      try {
        await this.onSubmit()
      } catch (e) {
        this.errorMessage = apiErrorMessage(e)
      } finally {
        this.isLoading = false
      }
    },
  },
}
</script>


<template lang="pug">
form.kl-card.kl-card--padded.create-form(@submit.prevent="handleSubmit")
  .create-form__body
    slot
  .create-form__footer
    button.kl-btn.kl-btn--primary(type="submit", :disabled="isLoading")
      | {{ isLoading ? 'Working...' : submitLabel }}
  p.kl-alert.kl-alert--danger(v-if="errorMessage") {{ errorMessage }}
</template>

<style scoped>
.create-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.create-form__body {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

/* Style default (unclassed) inputs inside the slot */
.create-form__body :deep(input),
.create-form__body :deep(select),
.create-form__body :deep(textarea) {
  display: block;
  width: 100%;
  padding: 0.55rem 0.75rem;
  font-size: 0.875rem;
  font-family: var(--font-sans);
  color: var(--color-text);
  background: var(--color-background-card);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-sm);
  transition: border-color var(--duration-fast) var(--ease),
    box-shadow var(--duration-fast) var(--ease);
}

.create-form__body :deep(input:focus),
.create-form__body :deep(select:focus),
.create-form__body :deep(textarea:focus) {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: var(--shadow-glow);
}

.create-form__body :deep(h3) {
  font-size: 0.82rem;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
  margin: 0.5rem 0 0.1rem;
}

.create-form__body :deep(h3:first-child) {
  margin-top: 0;
}

.create-form__footer {
  display: flex;
  justify-content: flex-end;
}
</style>
