<script>
import { MapPin, Flag } from 'lucide-vue-next'

const VARIANT_ICON = {
  origin: MapPin,
  destination: Flag,
}

const DEFAULT_PLACEHOLDERS = {
  origin: {
    name: 'Company or person name',
    street: 'Street name',
    number: '12a',
    postalCode: '4000',
    city: 'Basel',
  },
  destination: {
    name: 'Company or person name',
    street: 'Street name',
    number: '5',
    postalCode: '5000',
    city: 'Aarau',
  },
}

export default {
  name: 'AddressForm',
  props: {
    modelValue: { type: Object, required: true },
    title: { type: String, required: true },
    subtitle: { type: String, default: '' },
    variant: {
      type: String,
      default: 'origin',
      validator: v => Object.keys(VARIANT_ICON).includes(v),
    },
  },
  computed: {
    iconComponent() {
      return VARIANT_ICON[this.variant]
    },
    placeholders() {
      return DEFAULT_PLACEHOLDERS[this.variant]
    },
  },
}
</script>

<template lang="pug">
section.kl-card.kl-card--padded.form-section
  header.form-section__head
    .form-section__icon(:class="`form-section__icon--${variant}`")
      component(:is="iconComponent", :size="16", :stroke-width="1.75")
    div
      h3 {{ title }}
      p.kl-muted(v-if="subtitle") {{ subtitle }}
  .kl-form-row(style="--cols: 1")
    .kl-field
      label.kl-label Name
      input.kl-input(v-model="modelValue.name" :placeholder="placeholders.name" required)
  .kl-form-row(style="--cols: 1fr 100px")
    .kl-field
      label.kl-label Street
      input.kl-input(v-model="modelValue.street" :placeholder="placeholders.street" required)
    .kl-field
      label.kl-label Nr.
      input.kl-input(v-model="modelValue.number" :placeholder="placeholders.number" required)
  .kl-form-row(style="--cols: 120px 1fr")
    .kl-field
      label.kl-label Postal
      input.kl-input(v-model="modelValue.postalCode" :placeholder="placeholders.postalCode" required)
    .kl-field
      label.kl-label City
      input.kl-input(v-model="modelValue.city" :placeholder="placeholders.city" required)
</template>

<style scoped>
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

.form-section__head h3 {
  margin: 0;
  font-size: 1rem;
}

.form-section__head p {
  margin: 0.15rem 0 0;
  font-size: 0.8rem;
}

.form-section .kl-form-row + .kl-form-row {
  margin-top: 0.85rem;
}
</style>
