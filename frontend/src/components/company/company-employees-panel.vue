<script>
import { mapActions } from 'pinia'
import { useEmployeeStore } from '@/stores/employee-store'
import { Key, Pencil, Plus, Trash2 } from 'lucide-vue-next'

const emptyEmployeeForm = () => ({
  name: '',
  email: '',
  profile: 'DISPATCHER',
})

export default {
  name: 'CompanyEmployeesPanel',
  components: { Key, Pencil, Plus, Trash2 },
  props: {
    employees: {
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
  },
  data() {
    return {
      editingEmployeeId: null,
      employeeForm: emptyEmployeeForm(),
      resetTarget: null,
      newPassword: '',
      error: null,
      success: null,
    }
  },
  methods: {
    ...mapActions(useEmployeeStore, {
      updateEmployee: 'updateEmployee',
      deleteEmployee: 'deleteEmployee',
      resetEmployeePassword: 'resetEmployeePassword',
    }),
    clearMessages() {
      this.error = null
      this.success = null
    },
    closeAllForms() {
      this.editingEmployeeId = null
      this.employeeForm = emptyEmployeeForm()
      this.resetTarget = null
      this.newPassword = ''
    },
    openEditEmployee(employee) {
      this.closeAllForms()
      this.clearMessages()
      this.editingEmployeeId = employee._id
      this.employeeForm = {
        name: employee.name || '',
        email: employee.account?.email || '',
        profile: employee.profile || 'DISPATCHER',
      }
    },
    cancelEditEmployee() {
      this.editingEmployeeId = null
      this.employeeForm = emptyEmployeeForm()
      this.clearMessages()
    },
    openResetPassword(employeeId) {
      this.closeAllForms()
      this.clearMessages()
      this.resetTarget = employeeId
    },
    cancelResetPassword() {
      this.resetTarget = null
      this.newPassword = ''
      this.clearMessages()
    },
    isResetOpen(employeeId) {
      return this.resetTarget === employeeId
    },
    async submitEmployee() {
      try {
        this.clearMessages()
        await this.updateEmployee(this.companyId, this.editingEmployeeId, this.employeeForm)
        this.editingEmployeeId = null
        this.employeeForm = emptyEmployeeForm()
        this.success = 'Employee updated'
      } catch (err) {
        this.error = err.response?.data?.error || err.message
      }
    },
    async removeEmployee(employeeId) {
      if (!confirm('Are you sure you want to delete this employee and their account?')) return
      try {
        this.clearMessages()
        await this.deleteEmployee(this.companyId, employeeId)
        this.success = 'Employee deleted'
      } catch (err) {
        this.error = err.response?.data?.error || err.message
      }
    },
    async submitResetPassword() {
      try {
        this.clearMessages()
        if (!this.resetTarget) return
        await this.resetEmployeePassword(this.companyId, this.resetTarget, this.newPassword)
        this.resetTarget = null
        this.newPassword = ''
        this.success = 'Password reset successfully'
      } catch (err) {
        this.error = err.response?.data?.error || err.message
      }
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
      h2 Employees
      p.kl-muted.section-sub Dispatchers and company staff.
    router-link.kl-btn.kl-btn--primary.kl-btn--sm(:to="`/companies/${companyId}/employees`")
      Plus(:size="14", :stroke-width="2")
      | Add employee
  div.kl-alert.kl-alert--danger.panel-alert(v-if="error") {{ error }}
  div.kl-alert.kl-alert--success.panel-alert(v-if="success") {{ success }}
  ul.list
    li.list-item(v-for="employee in employees", :key="employee._id")
      .list-item__main
        .avatar {{ initials(employee.name) }}
        .list-item__info
          .list-item__name {{ employee.name }}
          .list-item__meta {{ employee.profile }}
        .list-item__actions(v-if="canManage")
          button.kl-btn.kl-btn--ghost.kl-btn--sm(title="Edit", @click="openEditEmployee(employee)")
            Pencil(:size="14", :stroke-width="1.75")
          button.kl-btn.kl-btn--ghost.kl-btn--sm(title="Reset password", @click="openResetPassword(employee._id)")
            Key(:size="14", :stroke-width="1.75")
          button.kl-btn.kl-btn--ghost.kl-btn--sm.danger-icon(title="Delete", @click="removeEmployee(employee._id)")
            Trash2(:size="14", :stroke-width="1.75")
      .inline-panel(v-if="canManage && isResetOpen(employee._id)")
        form.inline-panel__row(@submit.prevent="submitResetPassword")
          .kl-field.flex-grow
            label.kl-label New password
            input.kl-input(v-model="newPassword", type="password", required, minlength="6")
          .inline-panel__actions.inline-panel__actions--row
            button.kl-btn.kl-btn--primary(type="submit") Save
            button.kl-btn.kl-btn--ghost(type="button", @click="cancelResetPassword") Cancel
      .inline-panel(v-if="canManage && editingEmployeeId === employee._id")
        form(@submit.prevent="submitEmployee")
          .kl-form-row
            .kl-field
              label.kl-label Name
              input.kl-input(v-model="employeeForm.name", required)
            .kl-field
              label.kl-label Email
              input.kl-input(v-model="employeeForm.email", type="email", required)
          .kl-form-row.form-gap-top
            .kl-field.form-single-column
              label.kl-label Profile
              input.kl-input(v-model="employeeForm.profile")
          .inline-panel__actions
            button.kl-btn.kl-btn--primary(type="submit") Save
            button.kl-btn.kl-btn--ghost(type="button", @click="cancelEditEmployee") Cancel
    li.list__empty(v-if="!employees.length") No employees yet.
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

.form-gap-top {
  margin-top: 0.85rem;
}

.form-single-column {
  grid-column: 1 / -1;
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
