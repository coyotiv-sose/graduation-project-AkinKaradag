<script>
import { mapState, mapActions } from 'pinia'
import { useEmployeeStore } from '@/stores/employee-store'
import CreateFormWrapper from './create-form-wrapper.vue'

export default {
  name: 'EmployeeForm',
  components: { CreateFormWrapper },
  props: {
    companyId: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      email: '',
      password: '',
      name: '',
    }
  },
  computed: {
    ...mapState(useEmployeeStore, ['employees']),
  },
  methods: {
    ...mapActions(useEmployeeStore, ['getAllEmployees', 'createEmployee']),
    async submitEmployee() {
      await this.createEmployee(this.companyId, {
        email: this.email,
        password: this.password,
        name: this.name,
      })
      this.email = ''
      this.password = ''
      this.name = ''
    },
    initials(name) {
      if (!name) return '?'
      return name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map(p => p[0]?.toUpperCase() || '')
        .join('')
    },
  },
  async mounted() {
    await this.getAllEmployees(this.companyId)
  },
}
</script>


<template lang="pug">
.employee-block
  CreateFormWrapper(:on-submit="submitEmployee", submit-label="Create employee")
    h3 Account info
    input(v-model="email", type="email", placeholder="Email", required)
    input(v-model="password", type="password", placeholder="Password", required)
    input(v-model="name", placeholder="Employee name", required)

  section.kl-card.kl-card--flush
    .kl-card-header
      h2 Employees
      span.kl-badge.kl-badge--muted {{ employees.length }}
    ul.list
      li.list-item(v-for="employee in employees", :key="employee._id")
        .avatar {{ initials(employee.name) }}
        .list-item__info
          .list-item__name {{ employee.name }}
          .list-item__meta {{ employee.profile }}
      li.list__empty(v-if="!employees.length") No employees yet.
</template>

<style scoped>
.list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.list-item {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.85rem 1.25rem;
  border-bottom: 1px solid var(--color-border);
}

.list-item:last-child {
  border-bottom: none;
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

.list__empty {
  padding: 1.5rem 1.25rem;
  text-align: center;
  color: var(--color-text-secondary);
  font-style: italic;
}
</style>
