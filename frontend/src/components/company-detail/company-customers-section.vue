<script>
import { Plus, Pencil, Trash2, Key } from 'lucide-vue-next'
import CustomerEditPanel from './customer-edit-panel.vue'
import PasswordResetPanel from './password-reset-panel.vue'
import { initials } from '@/utils/display-helpers'

export default {
  name: 'CompanyCustomersSection',
  components: { Plus, Pencil, Trash2, Key, CustomerEditPanel, PasswordResetPanel },
  props: {
    customers: { type: Array, default: () => [] },
    companies: { type: Array, default: () => [] },
    companyId: { type: [String, Number], required: true },
    canManage: { type: Boolean, default: false },
    isAdmin: { type: Boolean, default: false },
    editingCustomerId: { type: [String, Number], default: null },
    customerForm: { type: Object, required: true },
    resetTarget: { type: Object, default: null },
    newPassword: { type: String, default: '' },
  },
  emits: [
    'edit-customer',
    'delete-customer',
    'reset-password',
    'submit-reset-password',
    'cancel-reset-password',
    'update-new-password',
    'update-customer-form',
    'submit-customer',
    'cancel-customer',
  ],
  methods: {
    initials,
    isResetOpen(customerId) {
      return this.resetTarget?.type === 'customer' && this.resetTarget.id === customerId
    },
  },
}
</script>

<template lang="pug">
section.kl-card.kl-card--flush.section
  .kl-card-header
    div
      h2 Customers
      p.kl-muted.section-sub Customers belonging to this company.
    router-link.kl-btn.kl-btn--primary.kl-btn--sm(:to="`/companies/${companyId}/customers`")
      Plus(:size="14", :stroke-width="2")
      | Add customer
  ul.list
    li.list-item(v-for="customer in customers", :key="customer._id")
      .list-item__main
        .avatar {{ initials(customer.customerName) }}
        .list-item__info
          .list-item__name {{ customer.customerName }}
          .list-item__meta {{ customer.account?.email }}
        .list-item__actions(v-if="canManage")
          button.kl-btn.kl-btn--ghost.kl-btn--sm(title="Edit", @click="$emit('edit-customer', customer)")
            Pencil(:size="14", :stroke-width="1.75")
          button.kl-btn.kl-btn--ghost.kl-btn--sm(
            title="Reset password"
            @click="$emit('reset-password', 'customer', customer._id)"
          )
            Key(:size="14", :stroke-width="1.75")
          button.kl-btn.kl-btn--ghost.kl-btn--sm.danger-icon(
            title="Delete"
            @click="$emit('delete-customer', customer._id)"
          )
            Trash2(:size="14", :stroke-width="1.75")
      PasswordResetPanel(
        v-if="canManage && isResetOpen(customer._id)"
        :password="newPassword"
        @update-password="$emit('update-new-password', $event)"
        @submit="$emit('submit-reset-password')"
        @cancel="$emit('cancel-reset-password')"
      )
      CustomerEditPanel(
        v-if="canManage && editingCustomerId === customer._id"
        :form="customerForm"
        :companies="companies"
        :is-admin="isAdmin"
        @update-form="$emit('update-customer-form', $event)"
        @submit="$emit('submit-customer')"
        @cancel="$emit('cancel-customer')"
      )
    li.list__empty(v-if="!customers.length") No customers yet.
</template>

<style scoped src="./company-detail-shared.css"></style>
