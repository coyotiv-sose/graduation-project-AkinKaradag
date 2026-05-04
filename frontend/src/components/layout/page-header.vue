<script>
export default {
  name: 'PageHeader',
  props: {
    title: { type: String, required: true },
    subtitle: { type: String, default: '' },
    backTo: { type: [String, Object], default: null },
    backLabel: { type: String, default: 'Back' },
  },
}
</script>


<template lang="pug">
header.page-header
  .page-header__top
    router-link.page-header__back(v-if="backTo", :to="backTo")
      span(aria-hidden="true") &larr;
      |  {{ backLabel }}
  .page-header__row
    .page-header__text
      h1.page-header__title {{ title }}
      p.page-header__subtitle(v-if="subtitle") {{ subtitle }}
    .page-header__actions(v-if="$slots.actions")
      slot(name="actions")
</template>

<style scoped>
.page-header {
  padding: 1.5rem 0 1.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.page-header__top {
  min-height: 1.25rem;
}

.page-header__back {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: color var(--duration-fast) var(--ease);
}

.page-header__back:hover {
  color: var(--color-primary);
}

.page-header__row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.page-header__title {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.page-header__subtitle {
  margin: 0.35rem 0 0;
  color: var(--color-text-secondary);
  font-size: 0.95rem;
  max-width: 640px;
}

.page-header__actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}
</style>
