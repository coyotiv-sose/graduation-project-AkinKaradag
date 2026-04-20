<script>
import { mapState } from 'pinia'
import { useAccountStore } from '@/stores/account-store'
import ThemeToggle from './theme-toggle.vue'

export default {
  name: 'PublicTopNav',
  components: { ThemeToggle },
  computed: {
    ...mapState(useAccountStore, ['user']),
  },
}
</script>


<template lang="pug">
header.public-nav
  .public-nav__inner
    router-link.public-nav__brand(to="/")
      span.brand-mark(aria-hidden="true") K
      span.brand-text KaraLog
    nav.public-nav__links
      a(href="#services") Services
      a(href="#about") About
      a(href="#contact") Contact
    .public-nav__actions
      ThemeToggle
      router-link.kl-btn.kl-btn--outline.kl-btn--sm(v-if="!user", to="/login")
        | Sign in
      router-link.kl-btn.kl-btn--primary.kl-btn--sm(v-else, to="/")
        | Open app
</template>

<style scoped>
.public-nav {
  position: sticky;
  top: 0;
  z-index: 50;
  background: color-mix(in srgb, var(--color-background-card) 90%, transparent);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--color-border);
}

.public-nav__inner {
  max-width: 1180px;
  margin: 0 auto;
  padding: 0.85rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.public-nav__brand {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  color: var(--color-heading);
  font-weight: 700;
  font-size: 1rem;
  text-decoration: none;
  letter-spacing: -0.01em;
}

.brand-mark {
  width: 32px;
  height: 32px;
  border-radius: 9px;
  background: var(--color-primary);
  color: var(--color-primary-contrast);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.95rem;
  font-weight: 700;
  box-shadow: 0 0 0 2px var(--color-primary-soft);
}

.public-nav__links {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  margin-left: 1rem;
}

.public-nav__links a {
  color: var(--color-text-secondary);
  font-size: 0.875rem;
  font-weight: 500;
  text-decoration: none;
  transition: color var(--duration-fast) var(--ease);
}

.public-nav__links a:hover {
  color: var(--color-primary);
}

.public-nav__actions {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

@media (max-width: 640px) {
  .public-nav__links {
    display: none;
  }
}
</style>
