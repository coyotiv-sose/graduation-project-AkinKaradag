<script>
export default {
  name: 'HomeSectionHeader',
  props: {
    eyebrow: { type: String, required: true },
    title: { type: String, required: true },
    body: { type: String, default: '' },
    centered: { type: Boolean, default: false },
  },
}
</script>

<template lang="pug">
header(:class="['section__head', { 'section__head--centered': centered }]")
  span.eyebrow
    span.eyebrow__dot
    | {{ eyebrow }}
  h2 {{ title }}
  p(v-if="body") {{ body }}
</template>

<style scoped>
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
</style>
