<script>
import HomeSectionHeader from './home-section-header.vue'

export default {
  name: 'HomePartnersSection',
  components: { HomeSectionHeader },
  props: {
    companies: { type: Array, default: () => [] },
  },
}
</script>

<template lang="pug">
section.section.section--tight(v-if="companies.length")
  HomeSectionHeader(eyebrow="Partners", title="Trusted by logistics teams.")
  ul.partners
    li.partner(v-for="company in companies", :key="company._id")
      span.partner__name {{ company.companyName }}
      span.partner__city {{ company.city }}
</template>

<style scoped>
.section {
  padding: 3.5rem 0;
  border-top: 1px solid var(--color-border);
}

.section--tight {
  padding: 2.5rem 0;
}

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
</style>
