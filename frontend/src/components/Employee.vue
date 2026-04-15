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
    },
    async mounted() {
        await this.getAllEmployees(this.companyId)
    },
}
</script>

<template lang="pug">
CreateFormWrapper(:onSubmit='submitEmployee', submitLabel='Create employee')
    h3 Account Info
    input(v-model='email' placeholder='E-Mail')
    input(v-model='password' type='password' placeholder='Password')
    input(v-model='name' placeholder='Employee Name')

h2 Employees
ul
    li(v-for='employee in employees' :key='employee._id')
        | {{ employee.name }} - {{ employee.profile }}
</template>
