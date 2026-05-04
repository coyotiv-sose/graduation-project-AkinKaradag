<script>
import { mapState, mapActions } from 'pinia'
import { useCustomerStore } from '@/stores/customer-store'
import CreateFormWrapper from './create-form-wrapper.vue'
import { initials } from '@/utils/display-helpers'

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
      },
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
    initials,
  },
  async mounted() {
    await this.getAllCustomers(this.companyId)
  },
  watch: {
    customerName(newName) {
      this.billingInfo.customerName = newName
    },
  },
}
</script>


<template lang="pug">
.customer-block
  CreateFormWrapper(:on-submit="submitCustomer", submit-label="Create customer")
    h3 Account info
    input(v-model="email", type="email", placeholder="Email", required)
    input(v-model="password", type="password", placeholder="Password", required)
    input(v-model="customerName", placeholder="Customer name", required)

    h3 Billing info
    input(v-model="billingInfo.label", placeholder="Label (e.g. HQ)")
    input(v-model="billingInfo.customerName", placeholder="Billing name")
    input(v-model="billingInfo.address", placeholder="Address")
    .customer-block__row
      input(v-model="billingInfo.postalCode", placeholder="Postal code")
      input(v-model="billingInfo.city", placeholder="City")
    input(v-model="billingInfo.VATnr", placeholder="VAT number")

  section.kl-card.kl-card--flush
    .kl-card-header
      h2 Customers
      span.kl-badge.kl-badge--muted {{ customers.length }}
    ul.list
      li.list-item(v-for="customer in customers", :key="customer._id")
        .avatar {{ initials(customer.customerName) }}
        .list-item__info
          .list-item__name {{ customer.customerName }}
          .list-item__meta {{ customer.account.email }}
      li.list__empty(v-if="!customers.length") No customers yet.
</template>

<style scoped>
.customer-block__row {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 0.5rem;
}

.customer-block__row :deep(input) {
  margin: 0;
}

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
