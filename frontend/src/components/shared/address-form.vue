<script>
import { MapPin, Flag } from 'lucide-vue-next'

const VARIANT_ICON = {
  origin: MapPin,
  destination: Flag,
}

const VARIANT_ICON_CLASS = {
  origin: '',
  destination: 'kl-section-icon--info',
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
    iconClass() {
      return VARIANT_ICON_CLASS[this.variant]
    },
    placeholders() {
      return DEFAULT_PLACEHOLDERS[this.variant]
    },
  },
}
</script>

<template lang="pug">
section.kl-card.kl-card--padded.kl-form-section
  header.kl-section-head
    .kl-section-icon(:class="iconClass")
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
