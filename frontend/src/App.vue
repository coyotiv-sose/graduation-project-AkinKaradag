<script>
import { RouterLink, RouterView } from 'vue-router'
import { mapState, mapActions } from 'pinia'
import { useAccountStore } from './stores/accountStore'
import { useSocketStore } from './stores/socketStore'
import ThemeToggle from './components/ThemeToggle.vue'
import NotificationBell from './components/NotificationBell.vue'

export default {
  name: 'App',
  components: {
    RouterLink,
    RouterView,
    ThemeToggle,
    NotificationBell,
  },
  computed: {
    ...mapState(useAccountStore, ['user', 'isCustomer', 'isEmployee', 'isAdmin', 'companyId', 'customerId']),
  },
  methods: {
    ...mapActions(useAccountStore, ['fetchUser']),
    ...mapActions(useSocketStore, ['init']),
  },
  async mounted() {
    await this.fetchUser()
    await this.init()
  },
}
</script>

<template lang="pug">
header
  nav.navbar.navbar-expand-lg.border-bottom
    .container
      RouterLink.navbar-brand(to="/")
        img(src="/logo.png" alt="KaraLog" height="40")
      button.navbar-toggler(
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
      )
        span.navbar-toggler-icon
      #navbarNav.collapse.navbar-collapse.justify-content-end
        ul.nav.nav-pills
          //- Always visible
          li.nav-item
            RouterLink.nav-link(to="/") Home

          //- Guest-only links
          template(v-if="!user")
            li.nav-item
              RouterLink.nav-link(to="/login") Login

          //- Customer links
          template(v-if="isCustomer")
            li.nav-item
              RouterLink.nav-link(to="/orders/new") Create Order
            li.nav-item
              RouterLink.nav-link(to="/orders") My Orders
            li.nav-item
              RouterLink.nav-link(to="/logout") Logout

          //- Dispatcher links
          template(v-if="isEmployee && companyId")
            li.nav-item
              RouterLink.nav-link(:to="`/companies/${companyId}/dispatcher`") Dashboard
            li.nav-item
              RouterLink.nav-link(to="/orders/new") Create Order
            li.nav-item
              RouterLink.nav-link(:to="`/companies/${companyId}/orders`") Orders
            li.nav-item
              RouterLink.nav-link(:to="`/companies/${companyId}/vehicles`") Vehicles
            li.nav-item
              RouterLink.nav-link(to="/logout") Logout

          //- Admin links
          template(v-if="isAdmin")
            li.nav-item
              RouterLink.nav-link(to="/admin") Admin Dashboard
            li.nav-item
              RouterLink.nav-link(to="/logout") Logout

          li.nav-item.d-flex.align-items-center.ms-2(v-if="user")
            NotificationBell
          li.nav-item.d-flex.align-items-center.ms-2
            ThemeToggle

RouterView
</template>

<style scoped>
.navbar {
  background: var(--color-background-card);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08), 0 4px 20px rgba(0, 0, 0, 0.06);
  border-radius: 14px;
  margin: 0.75rem 1rem 0;
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
}

.navbar-brand img {
  height: 40px;
}

.nav-pills .nav-link {
  color: var(--color-text);
  font-weight: 500;
  border-radius: var(--radius);
  transition: color 0.3s ease, background-color 0.3s ease;
}

.nav-pills .nav-link:hover {
  color: var(--color-primary);
  background-color: var(--color-primary-light);
}

.nav-pills .nav-link.router-link-exact-active {
  background-color: var(--color-primary);
  color: #fff;
}
</style>
