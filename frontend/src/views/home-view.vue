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
import HomeDispatchPreview from '@/components/home/home-dispatch-preview.vue'

const contactHref = 'mailto:akin@routewerk.com?subject=Account%20Request&body=Hello%2C%20I%20would%20like%20to%20request%20an%20account.'

const heroMetrics = [
  { value: '24/7', label: 'Live dispatching' },
  { value: 'AI', label: 'Order capture' },
  { value: '100%', label: 'Role-aware access' },
]

const features = [
  {
    icon: 'Truck',
    title: 'Transport orders',
    description: 'Structured pickups and deliveries with billing info, cargo details and live status.',
  },
  {
    icon: 'Gauge',
    title: 'Fleet & tours',
    description: 'Assign vehicles, plan tours and keep capacity visible across your whole company.',
  },
  {
    icon: 'Sparkles',
    title: 'AI order capture',
    description: 'Describe a shipment in plain language and get a structured order ready to dispatch.',
    accent: true,
  },
  {
    icon: 'Route',
    title: 'Real-time updates',
    description: 'Socket-powered state changes so dispatchers and customers stay in sync.',
  },
  {
    icon: 'Shield',
    title: 'Role-aware access',
    description: 'Admin, dispatcher and customer flows are separated with clean, enforced permissions.',
  },
  {
    icon: 'Leaf',
    title: 'Built to scale',
    description: 'Multi-company by design. Ready to grow with your logistics operations.',
  },
]

export default {
  name: 'HomeView',
  components: {
    ArrowRight,
    Gauge,
    HomeDispatchPreview,
    Leaf,
    Route,
    Shield,
    Sparkles,
    Truck,
  },
  data() {
    return {
      contactHref,
      features,
      heroMetrics,
    }
  },
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
main.home.kl-public-page
  section.hero
    .hero__inner
      .hero__copy
        span.kl-eyebrow
          span.kl-eyebrow__dot
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
          a.kl-btn.kl-btn--outline.kl-btn--lg(v-if="!isLoggedIn", :href="contactHref") Request an account
        .hero__metrics
          .metric(v-for="metric in heroMetrics", :key="metric.label")
            .metric__value {{ metric.value }}
            .metric__label {{ metric.label }}
      HomeDispatchPreview
  section#services.kl-section
    header.kl-section-head
      span.kl-eyebrow
        span.kl-eyebrow__dot
        | Core infrastructure
      h2 Everything your dispatch team needs.
      p A unified toolkit for customers, dispatchers and admins — from quote to delivery.
    .kl-feature-grid
      article.kl-feature-card(
        v-for="feature in features"
        :key="feature.title"
        :class="{ 'kl-feature-card--accent': feature.accent }"
      )
        .kl-feature-card__icon
          component(:is="feature.icon", :size="20", :stroke-width="1.75")
        h3 {{ feature.title }}
        p {{ feature.description }}
  section#about.kl-section.kl-section--tight
    header.kl-section-head.kl-section-head--centered
      span.kl-eyebrow
        span.kl-eyebrow__dot
        | About
      h2 Who we are.
      p RouteWerk is a logistics platform that simplifies transport operations for companies of every size. We handle customers, employees, orders, vehicles and tours from a single dashboard — so you can focus on moving cargo, not wrangling spreadsheets.
  section.kl-section.kl-section--tight(v-if="companies.length")
    header.kl-section-head
      span.kl-eyebrow
        span.kl-eyebrow__dot
        | Partners
      h2 Trusted by logistics teams.
    ul.kl-partner-list
      li.kl-partner-item(v-for="company in companies", :key="company._id")
        span.kl-partner-name {{ company.companyName }}
        span.kl-partner-meta {{ company.city }}
  section#contact.kl-section
    .kl-cta
      div
        h2 Ready to dispatch smarter?
        p.kl-muted Get in touch and we’ll set up your company account.
      a.kl-btn.kl-btn--primary.kl-btn--lg(:href="contactHref")
        | Contact us
        ArrowRight(:size="16", :stroke-width="2")
</template>

<style scoped>
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

@media (max-width: 960px) {
  .hero__inner {
    grid-template-columns: 1fr;
  }

  .kl-feature-grid {
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
}
</style>
