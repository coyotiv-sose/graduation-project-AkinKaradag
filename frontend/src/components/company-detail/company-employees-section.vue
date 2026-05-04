<script>
import { Plus, Pencil, Trash2, Key } from 'lucide-vue-next'
import EmployeeEditPanel from './employee-edit-panel.vue'
import PasswordResetPanel from './password-reset-panel.vue'
import { initials } from '@/utils/display-helpers'

export default {
  name: 'CompanyEmployeesSection',
  components: { Plus, Pencil, Trash2, Key, EmployeeEditPanel, PasswordResetPanel },
  props: {
    employees: { type: Array, default: () => [] },
    companyId: { type: [String, Number], required: true },
    canManage: { type: Boolean, default: false },
    editingEmployeeId: { type: [String, Number], default: null },
    employeeForm: { type: Object, required: true },
    resetTarget: { type: Object, default: null },
    newPassword: { type: String, default: '' },
  },
  emits: [
    'edit-employee',
    'delete-employee',
    'reset-password',
    'submit-reset-password',
    'cancel-reset-password',
    'update-new-password',
    'update-employee-form',
    'submit-employee',
    'cancel-employee',
  ],
  methods: {
    initials,
    isResetOpen(employeeId) {
      return this.resetTarget?.type === 'employee' && this.resetTarget.id === employeeId
    },
  },
}
</script>

<template lang="pug">
section.kl-card.kl-card--flush.section
  .kl-card-header
    div
      h2 Employees
      p.kl-muted.section-sub Dispatchers and company staff.
    router-link.kl-btn.kl-btn--primary.kl-btn--sm(:to="`/companies/${companyId}/employees`")
      Plus(:size="14", :stroke-width="2")
      | Add employee
  ul.list
    li.list-item(v-for="employee in employees", :key="employee._id")
      .list-item__main
        .avatar {{ initials(employee.name) }}
        .list-item__info
          .list-item__name {{ employee.name }}
          .list-item__meta {{ employee.profile }}
        .list-item__actions(v-if="canManage")
          button.kl-btn.kl-btn--ghost.kl-btn--sm(title="Edit", @click="$emit('edit-employee', employee)")
            Pencil(:size="14", :stroke-width="1.75")
          button.kl-btn.kl-btn--ghost.kl-btn--sm(
            title="Reset password"
            @click="$emit('reset-password', 'employee', employee._id)"
          )
            Key(:size="14", :stroke-width="1.75")
          button.kl-btn.kl-btn--ghost.kl-btn--sm.danger-icon(
            title="Delete"
            @click="$emit('delete-employee', employee._id)"
          )
            Trash2(:size="14", :stroke-width="1.75")
      PasswordResetPanel(
        v-if="canManage && isResetOpen(employee._id)"
        :password="newPassword"
        @update-password="$emit('update-new-password', $event)"
        @submit="$emit('submit-reset-password')"
        @cancel="$emit('cancel-reset-password')"
      )
      EmployeeEditPanel(
        v-if="canManage && editingEmployeeId === employee._id"
        :form="employeeForm"
        @update-form="$emit('update-employee-form', $event)"
        @submit="$emit('submit-employee')"
        @cancel="$emit('cancel-employee')"
      )
    li.list__empty(v-if="!employees.length") No employees yet.
</template>

<style scoped src="./company-detail-shared.css"></style>
