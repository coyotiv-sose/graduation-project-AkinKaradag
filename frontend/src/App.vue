<script>
import { RouterLink, RouterView } from 'vue-router'
import { useAccountStore } from './stores/accountStore'

export default {
  name: 'App',
  components: {
    RouterLink,
    RouterView,
  },
  computed: {
    user() {
      return useAccountStore().user
    },
  },
  mounted() {
    useAccountStore().fetchUser()
  },
}
</script>

<template>
  <header>
    <nav>
      <RouterLink to="/" class="brand">KaraLog</RouterLink>
      <div class="nav-links">
        <RouterLink to="/#services">Services</RouterLink>
        <RouterLink to="/#about">Who We Are</RouterLink>
        <RouterLink to="/#contact">Contact</RouterLink>
        <template v-if="user">
          <RouterLink to="/companies">Companies</RouterLink>
          <RouterLink to="/orders/new">New Order</RouterLink>
          <RouterLink to="/orders/list">Order List</RouterLink>
          <RouterLink to="/orders">AI Orders</RouterLink>
          <RouterLink to="/logout">Logout</RouterLink>
        </template>
        <RouterLink v-else to="/login">Login</RouterLink>
      </div>
    </nav>
  </header>

  <RouterView />
</template>

<style scoped>
header {
  border-bottom: 1px solid var(--color-border);
}

nav {
  max-width: 900px;
  margin: 0 auto;
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.brand {
  font-size: 1.4rem;
  font-weight: bold;
  text-decoration: none;
  color: #2c7a2c;
}

.nav-links {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

.nav-links a {
  text-decoration: none;
  color: var(--color-text);
  font-size: 0.95rem;
}

.nav-links a:hover {
  color: #2c7a2c;
}

.nav-links a.router-link-exact-active {
  color: #2c7a2c;
  font-weight: 600;
}
</style>
