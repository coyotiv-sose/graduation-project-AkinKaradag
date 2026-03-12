<script>
import { useCustomerStore } from '@/stores/customerStore';
import CreateFormWrapper from './CreateFormWrapper.vue';
import { useCompanyStore } from '@/stores/companyStore';

export default {
    name: 'CustomerForm',
    components: { CreateFormWrapper },
    data() {
        return {
            selectedCompany: '',
            email: '',
            password: '',
            customerName: '',
            billingInfo: {
                label: 'default',
                customerName: '',
                address: '',
                postalCode: '',
                city: '',
                VATnr: '',
                isDefault: true,
            }
        }
    },
    computed: {
        companies() {
            return useCompanyStore().companies
        },
        customers() {
            return useCustomerStore().customers
        }
    },

    async mounted() {
       await useCompanyStore().getAllCompanies()
    },

    watch: {
        selectedCompany(companyId) {
            if(companyId) {
                useCustomerStore().getAllCustomers(companyId)
            }
        },
        customerName(newName) {
            this.billingInfo.customerName = newName
        }
    },

    methods: {
        async submitCustomer() {
            await useCustomerStore().createCustomer(this.selectedCompany, {
                email: this.email,
                password: this.password,
                customerName: this.customerName,
                billingInfo: [this.billingInfo],
            })
            this.email = ''
            this.password = ''
            this.customerName = ''
            this.billingInfo = []
        },
    },
}
</script>

<template lang="pug">
select(v-model='selectedCompany')
    option(disabled value='') Select a company
    option(v-for='company in companies' :key='company._id' :value='company._id')
        | {{ company.companyName }}
CreateFormWrapper(:onSubmit='submitCustomer', submitLabel='Create customer')
    h3 Account Info
    input(v-model='email' placeholder='E-Mail')
    input(v-model='password' type='password' placeholder='Password')
    input(v-model='customerName' placeholder='Customer Name')
    h3 Billing Info
    input(v-model='billingInfo.label' placeholder='Label (e.g. HQ)')
    input(v-model='billingInfo.customerName' placeholder='Billing Name')
    input(v-model='billingInfo.address' placeholder='Address')
    input(v-model='billingInfo.postalCode' placeholder='Postal Code')
    input(v-model='billingInfo.city' placeholder='City')
    input(v-model='billingInfo.VATnr' placeholder='VAT Number')

h2 customers
ul
    li(v-for='customer in customers' :key='customer._id')
        | {{ customer.customerName }} - {{ customer.account.email }}
</template>