<script>
import { mapActions } from 'pinia'
import { useAccountStore } from '../stores/account-store'

export default {
  name: 'LogoutView',
  methods: {
    ...mapActions(useAccountStore, ['logout']),
  },
  async mounted() {
    await this.logout()
    this.$router.push('/')
  },
}
</script>

<template>
  <main class="logout">
    <div class="logout__card">
      <div class="logout__spinner" aria-hidden="true" />
      <p>Signing you out...</p>
    </div>
  </main>
</template>

<style scoped>
.logout {
  min-height: calc(100vh - 64px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.logout__card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem 2rem;
  background: var(--color-background-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  box-shadow: var(--shadow-md);
  color: var(--color-text-secondary);
}

.logout__spinner {
  width: 18px;
  height: 18px;
  border: 2px solid var(--color-border-strong);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 800ms linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
