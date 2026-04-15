<script>
import { mapState, mapActions } from 'pinia'
import { useCompanyStore } from '@/stores/company-store'

export default {
  name: 'CompanyList',
  components: { ChevronRight, Building2 },
  computed: {
    ...mapState(useCompanyStore, ['companies']),
  },
  methods: {
    ...mapActions(useCompanyStore, ['getAllCompanies']),
  },
  async mounted() {
    await this.getAllCompanies()
  },
}
</script>

<template>
  <section class="kl-card kl-card--flush">
    <div class="kl-card-header">
      <div>
        <h2>Companies</h2>
        <p class="kl-muted sub">Browse every tenant in the KaraLog network.</p>
      </div>
      <span class="kl-badge kl-badge--muted">{{ companies.length }}</span>
    </div>

    <ul class="company-list">
      <li v-for="company in companies" :key="company._id">
        <router-link :to="`/companies/${company._id}`" class="company-item">
          <div class="company-item__icon">
            <Building2 :size="18" :stroke-width="1.75" />
          </div>
          <div class="company-item__body">
            <div class="company-item__name">{{ company.companyName }}</div>
            <div class="company-item__meta">{{ company.city }}</div>
          </div>
          <ChevronRight :size="16" :stroke-width="1.75" class="company-item__chev" />
        </router-link>
      </li>
      <li v-if="!companies.length" class="company-empty">No companies registered yet.</li>
    </ul>
  </section>
</template>

<style scoped>
.sub {
  margin: 0.25rem 0 0;
  font-size: 0.85rem;
}

.company-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.company-item {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 0.85rem;
  padding: 0.9rem 1.25rem;
  border-bottom: 1px solid var(--color-border);
  text-decoration: none;
  transition: background-color var(--duration-fast) var(--ease);
}

.company-list li:last-child .company-item {
  border-bottom: none;
}

.company-item:hover {
  background: var(--color-background-hover);
}

.company-item__icon {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm);
  background: var(--color-primary-soft);
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.company-item__name {
  font-weight: 500;
  color: var(--color-heading);
}

.company-item__meta {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  margin-top: 0.15rem;
}

.company-item__chev {
  color: var(--color-text-muted);
  transition: color var(--duration-fast) var(--ease);
}

.company-item:hover .company-item__chev {
  color: var(--color-primary);
}

.company-empty {
  padding: 2rem 1.25rem;
  text-align: center;
  color: var(--color-text-secondary);
  font-style: italic;
}
</style>
