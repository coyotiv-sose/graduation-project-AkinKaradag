<script>
import { mapActions } from 'pinia'
import { useAccountStore } from '../stores/account-store'
import { ArrowRight, Mail, Lock } from 'lucide-vue-next'

export default {
  name: 'LoginView',
  components: { ArrowRight, Mail, Lock },
  data() {
    return {
      email: '',
      password: '',
      error: '',
      isSubmitting: false,
    }
  },
  methods: {
    ...mapActions(useAccountStore, ['login']),
    async handleLogin() {
      this.error = ''
      this.isSubmitting = true
      try {
        await this.login(this.email, this.password)
        this.$router.push('/')
      } catch (e) {
        this.error = e.response?.data?.error || e.message || 'Unable to sign in'
      } finally {
        this.isSubmitting = false
      }
    },
  },
}
</script>


<template lang="pug">
main.auth
  section.auth__form
    .auth__form-inner
      span.auth__eyebrow
        span.auth__eyebrow-dot
        | KaraLog dispatcher hub
      h1.auth__title Welcome back.
      p.auth__subtitle
        | Sign in to access your orders, fleet and dispatching tools.

      form.auth__fields(@submit.prevent="handleLogin")
        .kl-field
          label.kl-label(for="email") Email
          .auth__input
            Mail(:size="16", :stroke-width="1.75", class="auth__input-icon")
            input#email.kl-input.auth__input-control(
              v-model="email"
              type="email"
              placeholder="name@company.com"
              autocomplete="email"
              required
            )
        .kl-field
          label.kl-label(for="password") Password
          .auth__input
            Lock(:size="16", :stroke-width="1.75", class="auth__input-icon")
            input#password.kl-input.auth__input-control(
              v-model="password"
              type="password"
              placeholder="Enter your password"
              autocomplete="current-password"
              required
            )
        p.kl-alert.kl-alert--danger(v-if="error") {{ error }}
        button.kl-btn.kl-btn--primary.kl-btn--lg.kl-btn--block(
          type="submit"
          :disabled="isSubmitting"
        )
          | {{ isSubmitting ? 'Signing in...' : 'Sign in' }}
          ArrowRight(:size="16", :stroke-width="2")

      p.auth__hint
        | No account yet?
        a(href="mailto:akin@karalog.com?subject=Account%20Request") Request access →

  aside.auth__panel(aria-hidden="true")
    .auth__panel-inner
      .auth__brand
        span.brand-mark K
        span.brand-text KaraLog
      blockquote.auth__quote
        | “Dispatching, orders and fleet tracking in one control plane.”
      .auth__panel-cards
        .panel-card
          .panel-card__label Live capacity
          .kl-progress
            .kl-progress__fill(style="--value: 78%")
        .panel-card
          .panel-card__label Active routes
          .panel-card__value 24
        .panel-card
          .panel-card__label On-time rate
          .panel-card__value 98%
</template>

<style scoped>
.auth {
  min-height: calc(100vh - 64px);
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
}

.auth__form {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem 1.5rem;
}

.auth__form-inner {
  width: 100%;
  max-width: 420px;
}

.auth__eyebrow {
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

.auth__eyebrow-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-primary);
  box-shadow: 0 0 0 4px var(--color-primary-soft);
}

.auth__title {
  margin-top: 1rem;
  font-size: 2rem;
  letter-spacing: -0.02em;
}

.auth__subtitle {
  margin-top: 0.5rem;
  color: var(--color-text-secondary);
}

.auth__fields {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1.75rem;
}

.auth__input {
  position: relative;
}

.auth__input-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-muted);
  pointer-events: none;
}

.auth__input-control {
  padding-left: 2.3rem;
}

.auth__hint {
  margin-top: 1.25rem;
  font-size: 0.85rem;
  color: var(--color-text-secondary);
}

/* Right side panel */
.auth__panel {
  position: relative;
  background:
    radial-gradient(circle at 0% 0%, var(--color-primary-soft), transparent 55%),
    var(--color-background-elevated);
  border-left: 1px solid var(--color-border);
  padding: 3rem;
  display: flex;
  align-items: center;
  overflow: hidden;
}

.auth__panel::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: linear-gradient(var(--color-border) 1px, transparent 1px),
    linear-gradient(90deg, var(--color-border) 1px, transparent 1px);
  background-size: 32px 32px;
  opacity: 0.4;
  pointer-events: none;
}

.auth__panel-inner {
  position: relative;
  max-width: 440px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.auth__brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--color-heading);
  font-weight: 700;
  font-size: 1.1rem;
  letter-spacing: -0.01em;
}

.brand-mark {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: var(--color-primary);
  color: var(--color-primary-contrast);
  font-weight: 700;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 0 3px var(--color-primary-soft);
}

.auth__quote {
  font-size: 1.25rem;
  line-height: 1.4;
  color: var(--color-heading);
  letter-spacing: -0.01em;
  border-left: 2px solid var(--color-primary);
  padding-left: 1rem;
  margin: 0;
}

.auth__panel-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.panel-card {
  padding: 0.85rem 1rem;
  background: var(--color-background-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-height: 74px;
}

.panel-card:first-child {
  grid-column: 1 / -1;
}

.panel-card__label {
  font-size: 0.72rem;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
}

.panel-card__value {
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--color-heading);
}

@media (max-width: 960px) {
  .auth {
    grid-template-columns: 1fr;
  }
  .auth__panel {
    display: none;
  }
}
</style>
