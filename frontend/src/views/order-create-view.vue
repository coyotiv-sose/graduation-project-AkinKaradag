<script>
import { mapState, mapActions } from 'pinia'
import { useOrderStore } from '@/stores/order-store'
import { useAccountStore } from '@/stores/account-store'
import PageHeader from '@/components/page-header.vue'
import { Plus, Trash2, Sparkles, MapPin, Flag, Package } from 'lucide-vue-next'

export default {
  name: 'OrderCreateView',
  components: { PageHeader, Plus, Trash2, Sparkles, MapPin, Flag, Package },
  data() {
    return {
      origin: { name: '', street: '', number: '', postalCode: '', city: '' },
      destination: { name: '', street: '', number: '', postalCode: '', city: '' },
      deliveryDate: '',
      note: '',
      cargos: [
        { loadCarrierType: 'Pallet', quantity: 1, weight: 0, dimensions: { width: 0, length: 0, height: 0 } },
      ],
      errorMessage: '',
      successMessage: '',
      isSubmitting: false,
      prompt: '',
      isGenerating: false,
      generatedOrder: null,
      aiError: '',
    }
  },
  computed: {
    ...mapState(useAccountStore, ['customerId', 'profile']),
    addressesComplete() {
      const filled = obj => Object.values(obj).every(v => String(v).trim())
      return filled(this.origin) && filled(this.destination) && !!this.deliveryDate
    },
    totalWeight() {
      return this.cargos.reduce((sum, c) => sum + Number(c.quantity || 0) * Number(c.weight || 0), 0)
    },
    totalUnits() {
      return this.cargos.reduce((sum, c) => sum + Number(c.quantity || 0), 0)
    },
    formattedDeliveryDate() {
      if (!this.deliveryDate) return '—'
      return new Date(this.deliveryDate).toLocaleDateString(undefined, {
        weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
      })
    },
  },
  methods: {
    ...mapActions(useOrderStore, ['createOrderForCustomer', 'generateOrderFromPrompt']),
    formatAddress(addr) {
      return `${addr.name}, ${addr.street} ${addr.number}, ${addr.postalCode} ${addr.city}`
    },
    shortAddress(addr) {
      if (!addr.city && !addr.street) return 'Not filled'
      return [addr.name, `${addr.postalCode} ${addr.city}`.trim()].filter(Boolean).join(' · ')
    },
    addCargo() {
      this.cargos.push({
        loadCarrierType: 'Pallet',
        quantity: 1,
        weight: 0,
        dimensions: { width: 0, length: 0, height: 0 },
      })
    },
    removeCargo(index) {
      if (this.cargos.length > 1) {
        this.cargos.splice(index, 1)
      }
    },
    async submitOrder() {
      this.errorMessage = ''
      this.successMessage = ''

      if (!this.customerId) {
        this.errorMessage = 'Profile not loaded'
        return
      }

      const billingInfo = this.profile?.billingInfo?.find(b => b.isDefault) || this.profile?.billingInfo?.[0]
      if (!billingInfo) {
        this.errorMessage = 'No billing info found on your account'
        return
      }

      this.isSubmitting = true
      try {
        await this.createOrderForCustomer(this.customerId, {
          origin: this.formatAddress(this.origin),
          destination: this.formatAddress(this.destination),
          deliveryDate: this.deliveryDate,
          cargos: this.cargos,
          billingInfo,
        })
        this.successMessage = 'Order created successfully!'
        this.origin = { name: '', street: '', number: '', postalCode: '', city: '' }
        this.destination = { name: '', street: '', number: '', postalCode: '', city: '' }
        this.deliveryDate = ''
        this.note = ''
        this.cargos = [
          { loadCarrierType: 'Pallet', quantity: 1, weight: 0, dimensions: { width: 0, length: 0, height: 0 } },
        ]
      } catch (e) {
        this.errorMessage = e.response?.data?.error || e.message
      } finally {
        this.isSubmitting = false
      }
    },
    async generateOrder() {
      if (!this.customerId) {
        this.aiError = 'Profile not loaded'
        return
      }
      if (!this.prompt.trim()) {
        this.aiError = 'Please enter a prompt'
        return
      }

      this.isGenerating = true
      this.aiError = ''
      this.generatedOrder = null

      try {
        const order = await this.generateOrderFromPrompt(this.customerId, this.prompt)
        this.generatedOrder = order
        this.prompt = ''
      } catch (e) {
        this.aiError = e.response?.data?.error || e.message || 'Failed to generate order'
      } finally {
        this.isGenerating = false
      }
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString()
    },
  },
}
</script>

<template>
  <div class="order-create">
    <PageHeader
      title="Create a transport order"
      subtitle="Enter pickup, delivery and cargo details, or describe the shipment to our AI assistant."
      back-to="/orders"
      back-label="Back to orders"
    />

    <div class="order-create__grid">
      <!-- FORM -->
      <form class="form-col" @submit.prevent="submitOrder">
        <section class="kl-card kl-card--padded form-section">
          <header class="form-section__head">
            <div class="form-section__icon form-section__icon--origin">
              <MapPin :size="16" :stroke-width="1.75" />
            </div>
            <div>
              <h3>Pickup origin</h3>
              <p class="kl-muted">Where is the shipment being collected from?</p>
            </div>
          </header>

          <div class="kl-form-row" style="--cols: 1">
            <div class="kl-field">
              <label class="kl-label">Name</label>
              <input v-model="origin.name" class="kl-input" placeholder="Company or person name" required />
            </div>
          </div>
          <div class="kl-form-row" style="--cols: 1fr 100px">
            <div class="kl-field">
              <label class="kl-label">Street</label>
              <input v-model="origin.street" class="kl-input" placeholder="Street name" required />
            </div>
            <div class="kl-field">
              <label class="kl-label">Nr.</label>
              <input v-model="origin.number" class="kl-input" placeholder="12a" required />
            </div>
          </div>
          <div class="kl-form-row" style="--cols: 120px 1fr">
            <div class="kl-field">
              <label class="kl-label">Postal</label>
              <input v-model="origin.postalCode" class="kl-input" placeholder="4000" required />
            </div>
            <div class="kl-field">
              <label class="kl-label">City</label>
              <input v-model="origin.city" class="kl-input" placeholder="Basel" required />
            </div>
          </div>
        </section>

        <section class="kl-card kl-card--padded form-section">
          <header class="form-section__head">
            <div class="form-section__icon form-section__icon--destination">
              <Flag :size="16" :stroke-width="1.75" />
            </div>
            <div>
              <h3>Delivery destination</h3>
              <p class="kl-muted">Where is the shipment going?</p>
            </div>
          </header>

          <div class="kl-form-row" style="--cols: 1">
            <div class="kl-field">
              <label class="kl-label">Name</label>
              <input v-model="destination.name" class="kl-input" placeholder="Company or person name" required />
            </div>
          </div>
          <div class="kl-form-row" style="--cols: 1fr 100px">
            <div class="kl-field">
              <label class="kl-label">Street</label>
              <input v-model="destination.street" class="kl-input" placeholder="Street name" required />
            </div>
            <div class="kl-field">
              <label class="kl-label">Nr.</label>
              <input v-model="destination.number" class="kl-input" placeholder="5" required />
            </div>
          </div>
          <div class="kl-form-row" style="--cols: 120px 1fr">
            <div class="kl-field">
              <label class="kl-label">Postal</label>
              <input v-model="destination.postalCode" class="kl-input" placeholder="5000" required />
            </div>
            <div class="kl-field">
              <label class="kl-label">City</label>
              <input v-model="destination.city" class="kl-input" placeholder="Aarau" required />
            </div>
          </div>
        </section>

        <section class="kl-card kl-card--padded form-section">
          <header class="form-section__head">
            <div class="form-section__icon form-section__icon--origin">
              <Package :size="16" :stroke-width="1.75" />
            </div>
            <div>
              <h3>Scheduling &amp; cargo</h3>
              <p class="kl-muted">Delivery window and shipment contents.</p>
            </div>
          </header>

          <div class="kl-form-row" style="--cols: 1fr 1fr">
            <div class="kl-field">
              <label class="kl-label">Delivery date</label>
              <input v-model="deliveryDate" class="kl-input" type="date" required />
            </div>
          </div>

          <div class="cargo-section" :class="{ 'cargo-section--disabled': !addressesComplete }">
            <p v-if="!addressesComplete" class="hint">
              Fill in all address fields and the delivery date to add cargo details.
            </p>

            <template v-if="addressesComplete">
              <div
                v-for="(cargo, index) in cargos"
                :key="index"
                class="cargo-entry"
              >
                <div class="cargo-entry__head">
                  <span>Cargo {{ index + 1 }}</span>
                  <button
                    v-if="cargos.length > 1"
                    type="button"
                    class="kl-btn kl-btn--ghost kl-btn--sm danger-icon"
                    title="Remove cargo"
                    @click="removeCargo(index)"
                  >
                    <Trash2 :size="14" :stroke-width="1.75" />
                  </button>
                </div>

                <div class="kl-form-row" style="--cols: 1fr 1fr 1fr">
                  <div class="kl-field">
                    <label class="kl-label">Type</label>
                    <select v-model="cargo.loadCarrierType" class="kl-select">
                      <option>Pallet</option>
                      <option>Box</option>
                      <option>Container</option>
                      <option>Envelope</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div class="kl-field">
                    <label class="kl-label">Quantity</label>
                    <input v-model.number="cargo.quantity" class="kl-input" type="number" min="1" required />
                  </div>
                  <div class="kl-field">
                    <label class="kl-label">Weight (kg)</label>
                    <input v-model.number="cargo.weight" class="kl-input" type="number" min="0" required />
                  </div>
                </div>

                <div class="kl-form-row" style="--cols: 1fr 1fr 1fr">
                  <div class="kl-field">
                    <label class="kl-label">Width (cm)</label>
                    <input v-model.number="cargo.dimensions.width" class="kl-input" type="number" min="0" />
                  </div>
                  <div class="kl-field">
                    <label class="kl-label">Length (cm)</label>
                    <input v-model.number="cargo.dimensions.length" class="kl-input" type="number" min="0" />
                  </div>
                  <div class="kl-field">
                    <label class="kl-label">Height (cm)</label>
                    <input v-model.number="cargo.dimensions.height" class="kl-input" type="number" min="0" />
                  </div>
                </div>
              </div>

              <button
                type="button"
                class="kl-btn kl-btn--outline"
                @click="addCargo"
              >
                <Plus :size="14" :stroke-width="2" /> Add another cargo
              </button>
            </template>
          </div>

          <div class="kl-form-row" style="--cols: 1">
            <div class="kl-field">
              <label class="kl-label">Note (optional)</label>
              <textarea v-model="note" class="kl-textarea" rows="3" placeholder="Additional notes..." />
            </div>
          </div>
        </section>

        <p v-if="errorMessage" class="kl-alert kl-alert--danger">{{ errorMessage }}</p>
        <p v-if="successMessage" class="kl-alert kl-alert--success">{{ successMessage }}</p>

        <div class="form-submit">
          <button
            type="submit"
            class="kl-btn kl-btn--primary kl-btn--lg"
            :disabled="isSubmitting || !addressesComplete"
          >
            {{ isSubmitting ? 'Creating...' : 'Submit order' }}
          </button>
        </div>
      </form>

      <!-- SUMMARY -->
      <aside class="summary-col">
        <div class="kl-card kl-card--padded summary">
          <h3>Order summary</h3>
          <p class="kl-muted summary__sub">Live preview based on your inputs.</p>

          <div class="summary-row">
            <span class="summary-row__label">Origin</span>
            <span class="summary-row__value">{{ shortAddress(origin) }}</span>
          </div>
          <div class="summary-row">
            <span class="summary-row__label">Destination</span>
            <span class="summary-row__value">{{ shortAddress(destination) }}</span>
          </div>
          <div class="summary-row">
            <span class="summary-row__label">Delivery</span>
            <span class="summary-row__value">{{ formattedDeliveryDate }}</span>
          </div>

          <div class="kl-divider" />

          <div class="summary-stats">
            <div>
              <div class="summary-stats__label">Cargo items</div>
              <div class="summary-stats__value">{{ cargos.length }}</div>
            </div>
            <div>
              <div class="summary-stats__label">Total units</div>
              <div class="summary-stats__value">{{ totalUnits }}</div>
            </div>
            <div>
              <div class="summary-stats__label">Total weight</div>
              <div class="summary-stats__value">{{ totalWeight }} kg</div>
            </div>
          </div>
        </div>

        <div class="kl-card kl-card--padded ai-section">
          <div class="ai-section__head">
            <div class="ai-section__icon">
              <Sparkles :size="16" :stroke-width="1.75" />
            </div>
            <div>
              <h3>Create with AI</h3>
              <p class="kl-muted">Describe your shipment in plain language.</p>
            </div>
          </div>
          <textarea
            v-model="prompt"
            class="kl-textarea"
            rows="4"
            placeholder="e.g. &quot;Ship 3 pallets of electronics from Berlin to Munich by next Friday, each pallet ~200kg&quot;"
            :disabled="isGenerating"
          />
          <button
            type="button"
            class="kl-btn kl-btn--primary kl-btn--block"
            :disabled="isGenerating || !prompt.trim()"
            @click="generateOrder"
          >
            {{ isGenerating ? 'Generating...' : 'Create order with AI' }}
          </button>
          <p v-if="aiError" class="kl-alert kl-alert--danger">{{ aiError }}</p>

          <div v-if="generatedOrder" class="generated-order">
            <div class="generated-order__head">
              <h4>Order created</h4>
              <span class="kl-badge kl-badge--primary">{{ generatedOrder.state }}</span>
            </div>
            <p><strong>Origin:</strong> {{ generatedOrder.origin }}</p>
            <p><strong>Destination:</strong> {{ generatedOrder.destination }}</p>
            <p><strong>Delivery:</strong> {{ formatDate(generatedOrder.deliveryDate) }}</p>
            <div class="kl-divider" />
            <h5>Cargos</h5>
            <div v-for="(cargo, idx) in generatedOrder.cargos" :key="idx" class="generated-cargo">
              <p>{{ cargo.quantity }}x {{ cargo.loadCarrierType }} — {{ cargo.weight }} kg</p>
              <p class="kl-muted small">
                {{ cargo.dimensions.width }} × {{ cargo.dimensions.length }} × {{ cargo.dimensions.height }} cm
              </p>
            </div>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.order-create {
  padding-bottom: 3rem;
}

.order-create__grid {
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr);
  gap: 1.5rem;
  align-items: start;
}

.form-col {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.summary-col {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  position: sticky;
  top: 1.5rem;
}

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

.form-section + .form-section {
  margin-top: 0;
}

.form-section .kl-form-row + .kl-form-row {
  margin-top: 0.85rem;
}

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

.form-submit {
  display: flex;
  justify-content: flex-end;
  padding: 0.5rem 0 1rem;
}

/* Summary */
.summary h3,
.ai-section h3 {
  margin: 0;
  font-size: 1rem;
}

.summary__sub {
  margin: 0.25rem 0 1rem;
  font-size: 0.85rem;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.55rem 0;
  font-size: 0.875rem;
}

.summary-row__label {
  color: var(--color-text-secondary);
  font-weight: 500;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.summary-row__value {
  color: var(--color-heading);
  text-align: right;
  font-weight: 500;
}

.summary-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.5rem;
}

.summary-stats__label {
  font-size: 0.7rem;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
}

.summary-stats__value {
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-heading);
  margin-top: 0.15rem;
}

/* AI section */
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

.ai-section__head p {
  margin: 0;
  font-size: 0.8rem;
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

@media (max-width: 1020px) {
  .order-create__grid {
    grid-template-columns: 1fr;
  }
  .summary-col {
    position: static;
  }
}
</style>
