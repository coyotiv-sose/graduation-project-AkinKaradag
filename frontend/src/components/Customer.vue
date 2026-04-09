<script>
import { mapState, mapActions } from 'pinia'
import { useCustomerStore } from '@/stores/customerStore'
import CreateFormWrapper from './CreateFormWrapper.vue'

export default {
    name: 'CustomerForm',
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
        ...mapState(useCustomerStore, ['customers']),
    },
    methods: {
        ...mapActions(useCustomerStore, ['getAllCustomers', 'createCustomer']),
        async submitCustomer() {
            await this.createCustomer(this.companyId, {
                email: this.email,
                password: this.password,
                customerName: this.customerName,
                billingInfo: [this.billingInfo],
            })
            this.email = ''
            this.password = ''
            this.customerName = ''
            this.billingInfo = {
                label: 'default',
                customerName: '',
                address: '',
                postalCode: '',
                city: '',
                VATnr: '',
                isDefault: true,
            }
        },
    },
    async mounted() {
        await this.getAllCustomers(this.companyId)
    },
    watch: {
        customerName(newName) {
            this.billingInfo.customerName = newName
        }
    },
}
</script>

<template lang="pug">
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

.card
    .card-header
        h2.mb-0 Customers
    .list-group.list-group-flush
        .list-group-item.list-group-item-action(v-for='customer in customers' :key='customer._id')
            .d-flex.justify-content-between.align-items-center
                span.fw-semibold {{ customer.customerName }}
                span.text-secondary {{ customer.account.email }}
</template>
