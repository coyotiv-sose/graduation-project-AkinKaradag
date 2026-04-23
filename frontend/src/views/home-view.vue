<script>
import { mapState, mapActions } from 'pinia'
import { useCompanyStore } from '@/stores/company-store'
import { useAccountStore } from '@/stores/account-store'
import {
  ArrowRight,
  Truck,
  Gauge,
  Route,
  Sparkles,
  Shield,
  Leaf,
} from 'lucide-vue-next'

export default {
  name: 'HomeView',
  components: { ArrowRight, Truck, Gauge, Route, Sparkles, Shield, Leaf },
  computed: {
    ...mapState(useCompanyStore, ['companies']),
    ...mapState(useAccountStore, ['isLoggedIn', 'isCustomer', 'isEmployee', 'companyId']),
    pageMainButton() {
      if (!this.isLoggedIn) return { to: '/login', label: 'Sign in' }
      if (this.isCustomer) return { to: '/orders/new', label: 'Create order' }
      if (this.isEmployee && this.companyId) return { to: `/companies/${this.companyId}/dispatcher`, label: 'Open dispatcher' }
      return { to: '/', label: 'Continue' }
    },
  },
  methods: {
    ...mapActions(useCompanyStore, ['getAllCompanies']),
  },
  async mounted() {
    await this.getAllCompanies()
  },
}
</script>


<template lang="pug">
main.home
  section.hero
    .hero__inner
      .hero__copy
        span.eyebrow
          span.eyebrow__dot
          | Logistics control plane
        h1.hero__title
          | Move cargo with
          span.accent  precision.
        p.hero__subtitle
          | RouteWerk orchestrates transport orders, fleets and dispatching for modern logistics companies — end to end, in one place.
        .hero__actions
          router-link.kl-btn.kl-btn--primary.kl-btn--lg(:to="pageMainButton.to")
            | {{ pageMainButton.label }}
            ArrowRight(:size="16", :stroke-width="2")
          a.kl-btn.kl-btn--outline.kl-btn--lg(v-if="!isLoggedIn", href="mailto:akin@routewerk.com?subject=Account%20Request&body=Hello%2C%20I%20would%20like%20to%20request%20an%20account.") Request an account
        .hero__metrics
          .metric
            .metric__value 24/7
            .metric__label Live dispatching
          .metric
            .metric__value AI
            .metric__label Order capture
          .metric
            .metric__value 100%
            .metric__label Role-aware access
      .hero__panel(aria-hidden="true")
        .panel-grid
          .panel-card
            .panel-card__head
              span.kl-badge.kl-badge--primary On route
              span.panel-card__id #ORD-8812
            .panel-card__title Basel → Zurich
            .panel-card__meta Capacity
            .kl-progress
              .kl-progress__fill(style="--value: 76%")
          .panel-card
            .panel-card__head
              span.kl-badge.kl-badge--warning Pending
              span.panel-card__id #ORD-9921
            .panel-card__title Aarau → Bern
            .panel-card__meta 2 pallets · 420 kg
          .panel-card.panel-card--wide
            .panel-card__head
              span.kl-badge.kl-badge--info Active fleet
            .fleet-row
              .fleet-dot
              span KN-8821
              span.kl-muted 82% cap
            .fleet-row
              .fleet-dot.fleet-dot--warn
              span KN-4402
              span.kl-muted delayed
            .fleet-row
              .fleet-dot.fleet-dot--muted
              span KN-9011
              span.kl-muted idle
  section#services.section
    header.section__head
      span.eyebrow
        span.eyebrow__dot
        | Core infrastructure
      h2 Everything your dispatch team needs.
      p A unified toolkit for customers, dispatchers and admins — from quote to delivery.
    .features
      article.feature-card
        .feature-card__icon
          Truck(:size="20", :stroke-width="1.75")
        h3 Transport orders
        p Structured pickups and deliveries with billing info, cargo details and live status.
      article.feature-card
        .feature-card__icon
          Gauge(:size="20", :stroke-width="1.75")
        h3 Fleet & tours
        p Assign vehicles, plan tours and keep capacity visible across your whole company.
      article.feature-card.feature-card--accent
        .feature-card__icon
          Sparkles(:size="20", :stroke-width="1.75")
        h3 AI order capture
        p Describe a shipment in plain language and get a structured order ready to dispatch.
      article.feature-card
        .feature-card__icon
          Route(:size="20", :stroke-width="1.75")
        h3 Real-time updates
        p Socket-powered state changes so dispatchers and customers stay in sync.
      article.feature-card
        .feature-card__icon
          Shield(:size="20", :stroke-width="1.75")
        h3 Role-aware access
        p Admin, dispatcher and customer flows are separated with clean, enforced permissions.
      article.feature-card
        .feature-card__icon
          Leaf(:size="20", :stroke-width="1.75")
        h3 Built to scale
        p Multi-company by design. Ready to grow with your logistics operations.
  section#about.section.section--tight
    header.section__head.section__head--centered
      span.eyebrow
        span.eyebrow__dot
        | About
      h2 Who we are.
      p RouteWerk is a logistics platform that simplifies transport operations for companies of every size. We handle customers, employees, orders, vehicles and tours from a single dashboard — so you can focus on moving cargo, not wrangling spreadsheets.
  section.section.section--tight(v-if="companies.length")
    header.section__head
      span.eyebrow
        span.eyebrow__dot
        | Partners
      h2 Trusted by logistics teams.
    ul.partners
      li.partner(v-for="company in companies", :key="company._id")
        span.partner__name {{ company.companyName }}
        span.partner__city {{ company.city }}
  section#contact.section
    .cta
      div
        h2 Ready to dispatch smarter?
        p.kl-muted Get in touch and we’ll set up your company account.
      a.kl-btn.kl-btn--primary.kl-btn--lg(href="mailto:akin@routewerk.com?subject=Account%20Request&body=Hello%2C%20I%20would%20like%20to%20request%20an%20account.")
        | Contact us
        ArrowRight(:size="16", :stroke-width="2")
</template>

<style scoped>
.home {
  max-width: 1180px;
  margin: 0 auto;
  padding: 0 1.5rem 4rem;
}

.eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.3rem 0.7rem;
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
  background: var(--color-background-hover);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-pill);
  font-weight: 600;
}

.eyebrow__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-primary);
  box-shadow: 0 0 0 4px var(--color-primary-soft);
}

/* Hero */
.hero {
  padding: 4rem 0 3rem;
}

.hero__inner {
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr);
  gap: 3rem;
  align-items: center;
}

.hero__title {
  margin-top: 1.25rem;
  font-size: clamp(2.4rem, 5vw, 3.75rem);
  line-height: 1.05;
  letter-spacing: -0.03em;
  font-weight: 700;
}

.hero__title .accent {
  color: var(--color-primary);
}

.hero__subtitle {
  margin-top: 1.1rem;
  font-size: 1.05rem;
  color: var(--color-text-secondary);
  max-width: 520px;
  line-height: 1.6;
}

.hero__actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1.75rem;
  flex-wrap: wrap;
}

.hero__metrics {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
  margin-top: 2.5rem;
  max-width: 520px;
}

.metric {
  padding: 0.85rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  background: var(--color-background-card);
}

.metric__value {
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--color-heading);
  letter-spacing: -0.01em;
}

.metric__label {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-top: 0.25rem;
}

/* Hero panel (decorative preview cards) */
.hero__panel {
  position: relative;
  padding: 1.5rem;
  border-radius: var(--radius-lg);
  background:
    radial-gradient(circle at 10% 0%, var(--color-primary-soft), transparent 50%),
    var(--color-background-elevated);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-lg);
}

.panel-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.85rem;
}

.panel-card {
  padding: 0.85rem 1rem;
  background: var(--color-background-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.panel-card--wide {
  grid-column: 1 / -1;
  gap: 0.5rem;
}

.panel-card__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.panel-card__id {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

.panel-card__title {
  font-weight: 600;
  color: var(--color-heading);
}

.panel-card__meta {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

.fleet-row {
  display: grid;
  grid-template-columns: 10px 1fr auto;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.85rem;
  padding: 0.3rem 0;
}

.fleet-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-soft);
}
.fleet-dot--warn { background: var(--color-warning); box-shadow: 0 0 0 3px var(--color-warning-soft); }
.fleet-dot--muted { background: var(--color-text-muted); box-shadow: none; }

/* Sections */
.section {
  padding: 3.5rem 0;
  border-top: 1px solid var(--color-border);
}

.section--tight {
  padding: 2.5rem 0;
}

.section__head {
  margin-bottom: 1.75rem;
}

.section__head--centered {
  text-align: center;
  max-width: 640px;
  margin-inline: auto;
}

.section__head h2 {
  margin-top: 0.6rem;
  font-size: clamp(1.75rem, 3vw, 2.25rem);
  letter-spacing: -0.02em;
}

.section__head p {
  margin-top: 0.6rem;
  color: var(--color-text-secondary);
  max-width: 580px;
}

.section__head--centered p {
  margin-inline: auto;
}

/* Features */
.features {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}

.feature-card {
  padding: 1.25rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  background: var(--color-background-card);
  transition: border-color var(--duration) var(--ease),
    box-shadow var(--duration) var(--ease),
    transform var(--duration) var(--ease);
}

.feature-card:hover {
  border-color: var(--color-border-hover);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.feature-card--accent {
  background:
    radial-gradient(circle at 100% 0%, var(--color-primary-soft), transparent 55%),
    var(--color-background-card);
  border-color: var(--color-primary-soft);
}

.feature-card__icon {
  width: 38px;
  height: 38px;
  border-radius: var(--radius-sm);
  background: var(--color-primary-soft);
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.85rem;
}

.feature-card h3 {
  margin: 0 0 0.35rem;
  font-size: 1rem;
}

.feature-card p {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin: 0;
  line-height: 1.55;
}

/* Partners */
.partners {
  list-style: none;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 0.75rem;
}

.partner {
  padding: 0.75rem 1rem;
  background: var(--color-background-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  font-size: 0.875rem;
}

.partner__name {
  font-weight: 500;
  color: var(--color-heading);
}

.partner__city {
  color: var(--color-text-secondary);
  font-size: 0.8rem;
}

/* CTA */
.cta {
  padding: 2rem;
  border-radius: var(--radius-lg);
  background:
    radial-gradient(circle at 20% 0%, var(--color-primary-soft), transparent 60%),
    var(--color-background-elevated);
  border: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.cta h2 {
  margin: 0;
  font-size: 1.5rem;
}

.cta p {
  margin: 0.35rem 0 0;
  font-size: 0.95rem;
}

/* Responsive */
@media (max-width: 960px) {
  .hero__inner {
    grid-template-columns: 1fr;
  }
  .features {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .hero {
    padding: 2.5rem 0 1.5rem;
  }
  .hero__metrics {
    grid-template-columns: 1fr;
  }
  .features {
    grid-template-columns: 1fr;
  }
  .panel-grid {
    grid-template-columns: 1fr;
  }
  .cta {
    align-items: flex-start;
  }
}
</style>
