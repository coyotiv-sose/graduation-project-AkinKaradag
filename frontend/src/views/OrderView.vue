<script>
import { useOrderStore } from '@/stores/orderStore'
import { useCustomerStore } from '@/stores/customerStore'
import { useCompanyStore } from '@/stores/companyStore'

export default {
  name: 'OrderView',
  data() {
    return {
      selectedCompany: '',
      selectedCustomer: '',
      prompt: '',
      isGenerating: false,
      generatedOrder: null,
      errorMessage: '',
    }
  },
  computed: {
    companies() {
      return useCompanyStore().companies
    },
    customers() {
      return useCustomerStore().customers
    },
    orders() {
      return useOrderStore().orders
    },
  },
  async mounted() {
    await useCompanyStore().getAllCompanies()
  },
  watch: {
    async selectedCompany(companyId) {
      if (companyId) {
        this.selectedCustomer = ''
        await useCustomerStore().getAllCustomers(companyId)
      }
    },
    async selectedCustomer(customerId) {
      if (customerId) {
        await useOrderStore().getOrders(customerId)
      }
    },
  },
  methods: {
    async generateOrder() {
      if (!this.selectedCustomer) {
        this.errorMessage = 'Please select a customer first'
        return
      }
      if (!this.prompt.trim()) {
        this.errorMessage = 'Please enter a prompt'
        return
      }

      this.isGenerating = true
      this.errorMessage = ''
      this.generatedOrder = null

      try {
        const order = await useOrderStore().generateOrderFromPrompt(
          this.selectedCustomer,
          this.prompt
        )
        this.generatedOrder = order
        this.prompt = ''
        await useOrderStore().getOrders(this.selectedCustomer)
      } catch (e) {
        this.errorMessage = e.response?.data?.error || e.message || 'Failed to generate order'
      } finally {
        this.isGenerating = false
      }
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString()
    },
  },
}
</script>

<template lang="pug">
main
  h1 AI Order Generator

  section.selectors
    label Company
    select(v-model='selectedCompany')
      option(disabled value='') Select a company
      option(v-for='company in companies' :key='company._id' :value='company._id')
        | {{ company.companyName }}

    label Customer
    select(v-model='selectedCustomer' :disabled='!selectedCompany')
      option(disabled value='') Select a customer
      option(v-for='customer in customers' :key='customer._id' :value='customer._id')
        | {{ customer.customerName }}

  section.prompt-section
    h2 Describe your order
    textarea(
      v-model='prompt'
      placeholder='e.g. "Ship 3 pallets of electronics from Berlin to Munich by next Friday, each pallet weighs about 200kg"'
      rows='4'
      :disabled='isGenerating'
    )
    button(@click='generateOrder' :disabled='isGenerating || !prompt.trim()')
      | {{ isGenerating ? 'Generating...' : 'Create Order with AI' }}
    p.error(v-if='errorMessage') {{ errorMessage }}

  section.result(v-if='generatedOrder')
    h2 Order Created
    .order-card
      p #[strong Origin:] {{ generatedOrder.origin }}
      p #[strong Destination:] {{ generatedOrder.destination }}
      p #[strong Delivery Date:] {{ formatDate(generatedOrder.deliveryDate) }}
      p #[strong Status:] {{ generatedOrder.state }}
      h3 Cargos
      .cargo(v-for='(cargo, index) in generatedOrder.cargos' :key='index')
        p {{ cargo.quantity }}x {{ cargo.loadCarrierType }} — {{ cargo.weight }}kg
        p.dims {{ cargo.dimensions.width }}×{{ cargo.dimensions.length }}×{{ cargo.dimensions.height }} cm

  section.orders-list(v-if='orders.length')
    h2 Existing Orders
    .order-card(v-for='order in orders' :key='order._id')
      p #[strong {{ order.origin }}] → #[strong {{ order.destination }}]
      p {{ formatDate(order.deliveryDate) }} · {{ order.state }}
      p {{ order.cargos.length }} cargo(s)
</template>

<style scoped lang="scss">
main {
  max-width: 700px;
  margin: 0 auto;
  padding: 2rem;
}

h1 {
  margin-bottom: 1.5rem;
}

.selectors {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;

  select {
    padding: 0.5rem;
    font-size: 1rem;
  }
}

.prompt-section {
  margin-bottom: 2rem;

  textarea {
    width: 100%;
    padding: 0.75rem;
    font-size: 1rem;
    border: 1px solid #ccc;
    border-radius: 6px;
    resize: vertical;
    font-family: inherit;
  }

  button {
    margin-top: 0.75rem;
    padding: 0.6rem 1.5rem;
    font-size: 1rem;
    background: #2c7a2c;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;

    &:disabled {
      background: #999;
      cursor: not-allowed;
    }
  }
}

.error {
  color: red;
  margin-top: 0.5rem;
}

.order-card {
  background: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;

  .cargo {
    padding-left: 1rem;
    border-left: 3px solid #2c7a2c;
    margin: 0.5rem 0;
  }

  .dims {
    font-size: 0.9rem;
    color: #666;
  }
}
</style>
