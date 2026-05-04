<script>
import { mapState, mapActions } from 'pinia'
import { useCompanyStore } from '@/stores/company-store'
import { useAccountStore } from '@/stores/account-store'
import HomeHero from '@/components/home/home-hero.vue'
import HomeSectionHeader from '@/components/home/home-section-header.vue'
import HomeFeaturesSection from '@/components/home/home-features-section.vue'
import HomePartnersSection from '@/components/home/home-partners-section.vue'
import HomeCta from '@/components/home/home-cta.vue'

export default {
  name: 'HomeView',
  components: {
    HomeHero,
    HomeSectionHeader,
    HomeFeaturesSection,
    HomePartnersSection,
    HomeCta,
  },
  computed: {
    ...mapState(useCompanyStore, ['publicCompanies']),
    ...mapState(useAccountStore, ['isLoggedIn', 'isCustomer', 'isEmployee', 'companyId']),
    pageMainButton() {
      if (!this.isLoggedIn) return { to: '/login', label: 'Sign in' }
      if (this.isCustomer) return { to: '/orders/new', label: 'Create order' }
      if (this.isEmployee && this.companyId) return { to: `/companies/${this.companyId}/dispatcher`, label: 'Open dispatcher' }
      return { to: '/', label: 'Continue' }
    },
  },
  methods: {
    ...mapActions(useCompanyStore, ['getPublicCompanies']),
  },
  async mounted() {
    await this.getPublicCompanies()
  },
}
</script>


<template lang="pug">
main.home
  HomeHero(:main-button="pageMainButton", :show-account-request="!isLoggedIn")
  HomeFeaturesSection
  section#about.section.section--tight
    HomeSectionHeader(
      eyebrow="About"
      title="Who we are."
      body="RouteWerk is a logistics platform that simplifies transport operations for companies of every size. We handle customers, employees, orders, vehicles and tours from a single dashboard — so you can focus on moving cargo, not wrangling spreadsheets."
      centered
    )
  HomePartnersSection(:companies="publicCompanies")
  HomeCta
</template>

<style scoped>
.home {
  max-width: 1180px;
  margin: 0 auto;
  padding: 0 1.5rem 4rem;
}

.section {
  padding: 2.5rem 0;
  border-top: 1px solid var(--color-border);
}
</style>
