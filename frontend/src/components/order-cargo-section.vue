<script>
import { Package, Plus, Trash2 } from 'lucide-vue-next'
import { createEmptyCargo } from '@/utils/order-form-helpers'

export default {
  name: 'OrderCargoSection',
  components: { Package, Plus, Trash2 },
  props: {
    cargos: { type: Array, required: true },
    deliveryDate: { type: String, default: '' },
    note: { type: String, default: '' },
    enabled: { type: Boolean, default: true },
  },
  emits: ['update:cargos', 'update:deliveryDate', 'update:note'],
  methods: {
    updateCargo(index, patch) {
      const next = this.cargos.map((c, i) => (i === index ? { ...c, ...patch } : c))
      this.$emit('update:cargos', next)
    },
    updateCargoDimension(index, key, value) {
      const cargo = this.cargos[index]
      const dimensions = { ...cargo.dimensions, [key]: value }
      this.updateCargo(index, { dimensions })
    },
    addCargo() {
      this.$emit('update:cargos', [...this.cargos, createEmptyCargo()])
    },
    removeCargo(index) {
      if (this.cargos.length <= 1) return
      this.$emit('update:cargos', this.cargos.filter((_, i) => i !== index))
    },
  },
}
</script>

<template lang="pug">
section.kl-card.kl-card--padded.kl-form-section
  header.kl-section-head
    .kl-section-icon
      Package(:size="16", :stroke-width="1.75")
    div
      h3 Scheduling & cargo
      p.kl-muted Delivery window and shipment contents.

  .kl-form-row(style="--cols: 1fr 1fr")
    .kl-field
      label.kl-label Delivery date
      input.kl-input(
        type="date"
        :value="deliveryDate"
        @input="$emit('update:deliveryDate', $event.target.value)"
        required
      )

  .cargo-section(:class="{ 'cargo-section--disabled': !enabled }")
    p.hint(v-if="!enabled")
      | Fill in all address fields and the delivery date to add cargo details.
    template(v-if="enabled")
      div.cargo-entry(v-for="(cargo, index) in cargos" :key="index")
        .cargo-entry__head
          span Cargo {{ index + 1 }}
          button.kl-btn.kl-btn--ghost.kl-btn--sm.danger-icon(
            v-if="cargos.length > 1"
            type="button"
            title="Remove cargo"
            @click="removeCargo(index)"
          )
            Trash2(:size="14", :stroke-width="1.75")
        .kl-form-row(style="--cols: 1fr 1fr 1fr")
          .kl-field
            label.kl-label Type
            select.kl-select(
              :value="cargo.loadCarrierType"
              @change="updateCargo(index, { loadCarrierType: $event.target.value })"
            )
              option Pallet
              option Box
              option Container
              option Envelope
              option Other
          .kl-field
            label.kl-label Quantity
            input.kl-input(
              type="number"
              :value="cargo.quantity"
              @input="updateCargo(index, { quantity: Number($event.target.value) })"
              min="1"
              required
            )
          .kl-field
            label.kl-label Weight (kg)
            input.kl-input(
              type="number"
              :value="cargo.weight"
              @input="updateCargo(index, { weight: Number($event.target.value) })"
              min="0"
              required
            )
        .kl-form-row(style="--cols: 1fr 1fr 1fr")
          .kl-field
            label.kl-label Width (cm)
            input.kl-input(
              type="number"
              :value="cargo.dimensions.width"
              @input="updateCargoDimension(index, 'width', Number($event.target.value))"
              min="0"
            )
          .kl-field
            label.kl-label Length (cm)
            input.kl-input(
              type="number"
              :value="cargo.dimensions.length"
              @input="updateCargoDimension(index, 'length', Number($event.target.value))"
              min="0"
            )
          .kl-field
            label.kl-label Height (cm)
            input.kl-input(
              type="number"
              :value="cargo.dimensions.height"
              @input="updateCargoDimension(index, 'height', Number($event.target.value))"
              min="0"
            )
      button.kl-btn.kl-btn--outline(type="button" @click="addCargo")
        Plus(:size="14", :stroke-width="2")
        |  Add another cargo

  .kl-form-row(style="--cols: 1")
    .kl-field
      label.kl-label Note (optional)
      textarea.kl-textarea(
        :value="note"
        @input="$emit('update:note', $event.target.value)"
        rows="3"
        placeholder="Additional notes..."
      )
</template>

<style scoped>
.cargo-section {
  margin-top: 1.25rem;
}

.cargo-section--disabled {
  opacity: 0.55;
  pointer-events: none;
}

.hint {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  font-style: italic;
  margin: 0 0 0.75rem;
}

.cargo-entry {
  padding: 1rem;
  border: 1px solid var(--color-border);
  border-left: 3px solid var(--color-primary);
  border-radius: var(--radius-sm);
  margin-bottom: 0.85rem;
  background: var(--color-background-subtle);
}

.cargo-entry__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.85rem;
  font-weight: 600;
  color: var(--color-heading);
}

.danger-icon:hover {
  color: var(--color-danger);
  background: var(--color-danger-soft);
}
</style>
