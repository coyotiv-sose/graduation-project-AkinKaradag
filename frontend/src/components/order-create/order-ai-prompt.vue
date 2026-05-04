<script>
import { mapActions } from 'pinia'
import { Sparkles } from 'lucide-vue-next'
import { useOrderStore } from '@/stores/order-store'
import { formatDate } from '@/utils/display-helpers'
import { apiErrorMessage } from '@/utils/error-helpers'

export default {
  name: 'OrderAiPrompt',
  components: { Sparkles },
  props: {
    customerId: { type: String, default: '' },
    billingInfo: { type: Object, default: null },
    isStaffMode: { type: Boolean, default: false },
    needsCustomerHint: { type: Boolean, default: false },
  },
  emits: ['generated'],
  data() {
    return {
      prompt: '',
      isGenerating: false,
      generatedOrder: null,
      aiError: '',
    }
  },
  computed: {
    canGenerate() {
      return !!this.customerId && !!this.billingInfo && !!this.prompt.trim() && !this.isGenerating
    },
    isDisabled() {
      return this.isGenerating || this.needsCustomerHint
    },
  },
  methods: {
    ...mapActions(useOrderStore, ['generateOrderFromPrompt']),
    formatDate,
    validate() {
      if (!this.customerId) {
        this.aiError = this.isStaffMode ? 'Select a customer first' : 'Profile not loaded'
        return false
      }
      if (!this.billingInfo) {
        this.aiError = 'Billing information is incomplete'
        return false
      }
      if (!this.prompt.trim()) {
        this.aiError = 'Please enter a prompt'
        return false
      }
      return true
    },
    async submitPrompt() {
      this.aiError = ''
      if (!this.validate()) return

      this.isGenerating = true
      this.generatedOrder = null
      try {
        const order = await this.generateOrderFromPrompt(this.customerId, this.prompt, this.billingInfo)
        this.generatedOrder = order
        this.prompt = ''
        this.$emit('generated', order)
      } catch (e) {
        this.aiError = apiErrorMessage(e, 'Failed to generate order')
      } finally {
        this.isGenerating = false
      }
    },
  },
}
</script>

<template lang="pug">
.kl-card.kl-card--padded.ai-section
  .ai-section__head
    .ai-section__icon
      Sparkles(:size="16", :stroke-width="1.75")
    div
      h3 Create with AI
      p.kl-muted Describe your shipment in plain language.
  p.kl-muted.hint(v-if="needsCustomerHint")
    | Select a customer above before generating with AI.
  textarea.kl-textarea(
    v-model="prompt"
    rows="4"
    placeholder='e.g. "Ship 3 pallets of electronics from Berlin to Munich by next Friday, each pallet ~200kg"'
    :disabled="isDisabled"
  )
  button.kl-btn.kl-btn--primary.kl-btn--block(
    type="button"
    :disabled="!canGenerate"
    @click="submitPrompt"
  )
    | {{ isGenerating ? 'Generating...' : 'Create order with AI' }}
  p.kl-alert.kl-alert--danger(v-if="aiError") {{ aiError }}
  div.generated-order(v-if="generatedOrder")
    .generated-order__head
      h4 Order created
      span.kl-badge.kl-badge--primary {{ generatedOrder.state }}
    p
      strong Origin:
      |  {{ generatedOrder.origin }}
    p
      strong Destination:
      |  {{ generatedOrder.destination }}
    p
      strong Delivery:
      |  {{ formatDate(generatedOrder.deliveryDate) }}
    .kl-divider
    h5 Cargos
    div.generated-cargo(v-for="(cargo, idx) in generatedOrder.cargos" :key="idx")
      p {{ cargo.quantity }}x {{ cargo.loadCarrierType }} — {{ cargo.weight }} kg
      p.kl-muted.small
        | {{ cargo.dimensions.width }} × {{ cargo.dimensions.length }} × {{ cargo.dimensions.height }} cm
</template>

<style scoped>
.ai-section {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.ai-section__head {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.ai-section__icon {
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

.ai-section__head h3 {
  margin: 0;
  font-size: 1rem;
}

.ai-section__head p {
  margin: 0;
  font-size: 0.8rem;
}

.hint {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  font-style: italic;
  margin: 0;
}

.generated-order {
  padding: 0.85rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-background-subtle);
  font-size: 0.875rem;
}

.generated-order h4 {
  margin: 0;
  font-size: 0.95rem;
}

.generated-order h5 {
  margin: 0 0 0.4rem;
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
}

.generated-order__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.generated-order p {
  margin: 0.2rem 0;
}

.generated-cargo + .generated-cargo {
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px dashed var(--color-border);
}

.generated-cargo .small {
  font-size: 0.8rem;
}
</style>
