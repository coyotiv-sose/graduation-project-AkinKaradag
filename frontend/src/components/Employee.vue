<script>
import { useEmployeeStore } from '@/stores/employeeStore'
import CreateFormWrapper from './CreateFormWrapper.vue'

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
        employees() {
            return useEmployeeStore().employees
        },
    },
    async mounted() {
        await useEmployeeStore().getAllEmployees(this.companyId)
    },
    methods: {
        async submitEmployee() {
            await useEmployeeStore().createEmployee(this.companyId, {
                email: this.email,
                password: this.password,
                name: this.name,
            })
            this.email = ''
            this.password = ''
            this.name = ''
        },
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
