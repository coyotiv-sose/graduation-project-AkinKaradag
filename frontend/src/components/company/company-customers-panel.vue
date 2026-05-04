<script>
import { mapActions } from 'pinia'
import { useCustomerStore } from '@/stores/customer-store'
import CompanyCustomerEditPanel from '@/components/company/company-customer-edit-panel.vue'
import { Key, Pencil, Plus, Trash2 } from 'lucide-vue-next'

export default {
  name: 'CompanyCustomersPanel',
  components: { CompanyCustomerEditPanel, Key, Pencil, Plus, Trash2 },
  props: {
    customers: {
      type: Array,
      default: () => [],
    },
    companies: {
      type: Array,
      default: () => [],
    },
    companyId: {
      type: String,
      required: true,
    },
    canManage: {
      type: Boolean,
      default: false,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      editingCustomerId: null,
      resetTarget: null,
      newPassword: '',
      error: null,
      success: null,
    }
  },
  methods: {
    ...mapActions(useCustomerStore, {
      deleteCustomer: 'deleteCustomer',
      resetCustomerPassword: 'resetCustomerPassword',
    }),
    clearMessages() {
      this.error = null
      this.success = null
    },
    closeAllForms() {
      this.editingCustomerId = null
      this.resetTarget = null
      this.newPassword = ''
    },
    openEditCustomer(customer) {
      this.closeAllForms()
      this.clearMessages()
      this.editingCustomerId = customer._id
    },
    cancelEditCustomer() {
      this.editingCustomerId = null
      this.clearMessages()
    },
    openResetPassword(customerId) {
      this.closeAllForms()
      this.clearMessages()
      this.resetTarget = customerId
    },
    cancelResetPassword() {
      this.resetTarget = null
      this.newPassword = ''
      this.clearMessages()
    },
    isResetOpen(customerId) {
      return this.resetTarget === customerId
    },
    async removeCustomer(customerId) {
      if (!confirm('Are you sure you want to delete this customer and their account?')) return
      try {
        this.clearMessages()
        await this.deleteCustomer(this.companyId, customerId)
        this.success = 'Customer deleted'
      } catch (err) {
        this.error = err.response?.data?.error || err.message
      }
    },
    async submitResetPassword() {
      try {
        this.clearMessages()
        if (!this.resetTarget) return
        await this.resetCustomerPassword(this.companyId, this.resetTarget, this.newPassword)
        this.resetTarget = null
        this.newPassword = ''
        this.success = 'Password reset successfully'
      } catch (err) {
        this.error = err.response?.data?.error || err.message
      }
    },
    handleCustomerSaved() {
      this.editingCustomerId = null
      this.success = 'Customer updated'
    },
    initials(name) {
      if (!name) return '?'
      return name
        .split(/[\s@]+/)
        .filter(Boolean)
        .slice(0, 2)
        .map(part => part[0]?.toUpperCase() || '')
        .join('')
    },
  },
}
</script>

<template lang="pug">
section.kl-card.kl-card--flush
  .kl-card-header
    div
      h2 Customers
      p.kl-muted.section-sub Customers belonging to this company.
    router-link.kl-btn.kl-btn--primary.kl-btn--sm(:to="`/companies/${companyId}/customers`")
      Plus(:size="14", :stroke-width="2")
      | Add customer
  div.kl-alert.kl-alert--danger.panel-alert(v-if="error") {{ error }}
  div.kl-alert.kl-alert--success.panel-alert(v-if="success") {{ success }}
  ul.list
    li.list-item(v-for="customer in customers", :key="customer._id")
      .list-item__main
        .avatar {{ initials(customer.customerName) }}
        .list-item__info
          .list-item__name {{ customer.customerName }}
          .list-item__meta {{ customer.account?.email }}
        .list-item__actions(v-if="canManage")
          button.kl-btn.kl-btn--ghost.kl-btn--sm(title="Edit", @click="openEditCustomer(customer)")
            Pencil(:size="14", :stroke-width="1.75")
          button.kl-btn.kl-btn--ghost.kl-btn--sm(title="Reset password", @click="openResetPassword(customer._id)")
            Key(:size="14", :stroke-width="1.75")
          button.kl-btn.kl-btn--ghost.kl-btn--sm.danger-icon(title="Delete", @click="removeCustomer(customer._id)")
            Trash2(:size="14", :stroke-width="1.75")
      .inline-panel(v-if="canManage && isResetOpen(customer._id)")
        form.inline-panel__row(@submit.prevent="submitResetPassword")
          .kl-field.flex-grow
            label.kl-label New password
            input.kl-input(v-model="newPassword", type="password", required, minlength="6")
          .inline-panel__actions.inline-panel__actions--row
            button.kl-btn.kl-btn--primary(type="submit") Save
            button.kl-btn.kl-btn--ghost(type="button", @click="cancelResetPassword") Cancel
      CompanyCustomerEditPanel(
        v-if="canManage && editingCustomerId === customer._id"
        :customer="customer"
        :companies="companies"
        :company-id="companyId"
        :is-admin="isAdmin"
        @cancel="cancelEditCustomer"
        @saved="handleCustomerSaved"
      )
    li.list__empty(v-if="!customers.length") No customers yet.
</template>

<style scoped>
.panel-alert {
  margin: 0 1.25rem 1rem;
}

.list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.list-item {
  border-bottom: 1px solid var(--color-border);
  padding: 0.85rem 1.25rem;
}

.list-item:last-child {
  border-bottom: none;
}

.list-item__main {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.list-item__info {
  min-width: 0;
  flex: 1;
}

.list-item__name {
  font-weight: 500;
  color: var(--color-heading);
}

.list-item__meta {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  margin-top: 0.15rem;
}

.list-item__actions {
  display: flex;
  gap: 0.25rem;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--color-primary-soft);
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.8rem;
  flex-shrink: 0;
}

.inline-panel {
  margin-top: 0.85rem;
  padding: 1rem;
  background: var(--color-background-subtle);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
}

.inline-panel__row {
  display: flex;
  align-items: flex-end;
  gap: 0.75rem;
}

.inline-panel__actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.inline-panel__actions--row {
  margin-top: 0;
}

.flex-grow {
  flex: 1;
}

.list__empty {
  padding: 1.5rem 1.25rem;
  text-align: center;
  color: var(--color-text-secondary);
  font-style: italic;
}

@media (max-width: 720px) {
  .inline-panel__row {
    flex-direction: column;
    align-items: stretch;
  }

  .inline-panel__actions--row {
    margin-top: 1rem;
  }
}
</style>
