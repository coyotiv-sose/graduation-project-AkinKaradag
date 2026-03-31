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
        button.btn.btn-outline-success Login
      a.btn.btn-outline-success(href='mailto:akin@karalog.com?subject=Account%20Request&body=Hello%2C%20I%20would%20like%20to%20request%20an%20account.%20Please%20get%20in%20touch.') Request an Account

  section#services.section
    h2 Services
    .cards
      .flip-card
        .flip-card-inner
          .flip-card-front
            h3 Transport Management
          .flip-card-back
            p End-to-end planning and execution of your logistics operations, from order creation to delivery.
      .flip-card
        .flip-card-inner
          .flip-card-front
            h3 Fleet Management
          .flip-card-back
            p Assign vehicles to tours, track capacity, and optimize your fleet utilization.
      .flip-card
        .flip-card-inner
          .flip-card-front
            h3 AI-Powered Orders
          .flip-card-back
            p Describe your shipment in plain language and let our AI create structured orders for you.
      .flip-card
        .flip-card-inner
          .flip-card-front
            h3 Customer & Billing
          .flip-card-back
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
    a.btn.btn-success(href='mailto:akin@karalog.com?subject=Account%20Request&body=Hello%2C%20I%20would%20like%20to%20request%20an%20account.%20Please%20get%20in%20touch.') Contact Us
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

.flip-card {
  perspective: 1000px;
  height: 180px;
}

.flip-card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.6s;
  transform-style: preserve-3d;
}

.flip-card:hover .flip-card-inner {
  transform: rotateY(180deg);
}

.flip-card-front,
.flip-card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  text-align: center;
}

.flip-card-front {
  background: #f5f5f5;
  border: 1px solid #ddd;
  color: #222;
}

.flip-card-back {
  background: #2c7a2c;
  color: white;
  transform: rotateY(180deg);
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
