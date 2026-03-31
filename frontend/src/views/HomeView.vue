<script>
import { useCompanyStore } from '@/stores/companyStore'

export default {
  name: 'HomeView',
  computed: {
    companies() {
      return useCompanyStore().companies
    },
  },
  async mounted() {
    await useCompanyStore().getAllCompanies()
  },
}
</script>

<template lang="pug">
main.landing

  section#hero.hero
    h1 KaraLog
    p.subtitle Your trusted partner for logistics and transport management
    .hero-actions
      router-link(to='/login')
        button.btn-primary Login
      a.btn-secondary(href='mailto:akin@karalog.com?subject=Account%20Request&body=Hello%2C%20I%20would%20like%20to%20request%20an%20account.%20Please%20get%20in%20touch.') Request an Account

  section#services.section
    h2 Services
    .cards
      .card
        h3 Transport Management
        p End-to-end planning and execution of your logistics operations, from order creation to delivery.
      .card
        h3 Fleet Management
        p Assign vehicles to tours, track capacity, and optimize your fleet utilization.
      .card
        h3 AI-Powered Orders
        p Describe your shipment in plain language and let our AI create structured orders for you.
      .card
        h3 Customer & Billing
        p Manage your customers, billing info, and order history all in one place.

  section#about.section
    h2 Who We Are
    p KaraLog is a logistics management platform built to simplify transport operations for companies of all sizes. We provide tools for managing customers, employees, orders, vehicles, and tours — all from a single dashboard.
    p Our mission is to make logistics efficient, transparent, and accessible.

  section#references.section
    h2 Our Partners
    ul.references-list(v-if='companies.length')
      li(v-for='company in companies' :key='company._id')
        | {{ company.companyName }} — {{ company.city }}
    p(v-else) Loading partners...

  section#contact.section
    h2 Contact
    p Interested in working with us? Send us a request and we'll set up your company account.
    a.btn-primary(href='mailto:akin@karalog.com?subject=Account%20Request&body=Hello%2C%20I%20would%20like%20to%20request%20an%20account.%20Please%20get%20in%20touch.') Contact Us
</template>

<style scoped>
.landing {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
}

.hero {
  text-align: center;
  padding: 3rem 0;
}

.hero h1 {
  font-size: 3rem;
  margin-bottom: 0.5rem;
}

.subtitle {
  font-size: 1.2rem;
  color: #666;
  margin-bottom: 2rem;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.btn-primary {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background: #2c7a2c;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  text-decoration: none;
}

.btn-primary:hover {
  background: #236b23;
}

.btn-secondary {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background: transparent;
  color: #2c7a2c;
  border: 2px solid #2c7a2c;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  text-decoration: none;
}

.btn-secondary:hover {
  background: #f0f9f0;
}

.section {
  padding: 2.5rem 0;
  border-top: 1px solid #eee;
}

.section h2 {
  font-size: 1.8rem;
  margin-bottom: 1rem;
}

.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
}

.card {
  background: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1.5rem;
  color: #222;
}

.card h3 {
  margin-bottom: 0.5rem;
}

.references-list {
  list-style: none;
  padding: 0;
}

.references-list li {
  padding: 0.5rem 0;
  border-bottom: 1px solid #eee;
}
</style>
