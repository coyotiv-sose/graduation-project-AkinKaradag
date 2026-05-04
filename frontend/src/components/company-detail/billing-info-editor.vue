<script>
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
  name: 'BillingInfoEditor',
  components: { Plus, Trash2 },
  props: {
    items: { type: Array, default: () => [] },
  },
  emits: ['update-items'],
  methods: {
    emitItems(items) {
      this.$emit('update-items', items)
    },
    addBillingItem() {
      this.emitItems([...this.items, emptyBillingItem()])
    },
    removeBillingItem(index) {
      this.emitItems(this.items.filter((_, i) => i !== index))
    },
    setDefaultBillingItem(index) {
      this.emitItems(this.items.map((item, i) => ({
        ...item,
        isDefault: i === index,
      })))
    },
    updateBillingField(index, key, value) {
      this.emitItems(this.items.map((item, i) => (i === index ? { ...item, [key]: value } : item)))
    },
  },
}
</script>

<template lang="pug">
.billing-editor
  .billing-head
    h4 Billing info
    button.kl-btn.kl-btn--outline.kl-btn--sm(type="button", @click="addBillingItem")
      Plus(:size="14", :stroke-width="2")
      | Add billing
  .billing-card(v-for="(item, index) in items", :key="item._id || index")
    .kl-form-row
      .kl-field
        label.kl-label Label
        input.kl-input(
          :value="item.label"
          @input="updateBillingField(index, 'label', $event.target.value)"
        )
      .kl-field
        label.kl-label Billing name
        input.kl-input(
          :value="item.customerName"
          required
          @input="updateBillingField(index, 'customerName', $event.target.value)"
        )
    .kl-form-row.billing-card__row
      .kl-field
        label.kl-label Address
        input.kl-input(
          :value="item.address"
          required
          @input="updateBillingField(index, 'address', $event.target.value)"
        )
    .kl-form-row.billing-card__row(style="--cols: 1fr 1fr 1fr")
      .kl-field
        label.kl-label Postal code
        input.kl-input(
          :value="item.postalCode"
          required
          @input="updateBillingField(index, 'postalCode', $event.target.value)"
        )
      .kl-field
        label.kl-label City
        input.kl-input(
          :value="item.city"
          required
          @input="updateBillingField(index, 'city', $event.target.value)"
        )
      .kl-field
        label.kl-label VAT nr
        input.kl-input(
          :value="item.VATnr"
          @input="updateBillingField(index, 'VATnr', $event.target.value)"
        )
    .billing-actions
      button.kl-btn.kl-btn--outline.kl-btn--sm(
        type="button"
        :disabled="item.isDefault"
        @click="setDefaultBillingItem(index)"
      ) {{ item.isDefault ? 'Default' : 'Set as default' }}
      button.kl-btn.kl-btn--ghost.kl-btn--sm.danger-icon(type="button", @click="removeBillingItem(index)")
        Trash2(:size="14", :stroke-width="1.75")
        | Remove
</template>

<style scoped>
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

.billing-card__row {
  margin-top: 0.85rem;
}

.billing-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.85rem;
  justify-content: space-between;
}
</style>
