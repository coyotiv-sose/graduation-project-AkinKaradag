<script>
import { Plus, Pencil, Trash2 } from 'lucide-vue-next'

export default {
  name: 'AdminDashboardCompanyTab',
  components: { Plus, Pencil, Trash2 },
  props: {
    companies: { type: Array, default: () => [] },
  },
  emits: ['open-create', 'edit-company', 'delete-company'],
}
</script>

<template lang="pug">
section.kl-card.kl-card--flush
  .kl-card-header
    div
      h2 Companies
      p.kl-muted.section-sub Operational tenants in the RouteWerk network.
    button.kl-btn.kl-btn--primary(type="button", @click="$emit('open-create')")
      Plus(:size="16", :stroke-width="2")
      | New company
  .kl-table-wrap
    table.kl-table
      thead
        tr
          th Name
          th Address
          th City
          th.kl-table__actions Actions
      tbody
        tr(v-for="company in companies", :key="company._id")
          td
            router-link(:to="`/companies/${company._id}`") {{ company.companyName }}
          td.kl-muted {{ company.address }}
          td.kl-muted {{ company.postalCode }} {{ company.city }}
          td.kl-table__actions
            button.kl-btn.kl-btn--ghost.kl-btn--sm(
              type="button"
              title="Edit"
              @click="$emit('edit-company', company)"
            )
              Pencil(:size="14", :stroke-width="1.75")
            button.kl-btn.kl-btn--ghost.kl-btn--sm.danger-icon(
              type="button"
              title="Delete"
              @click="$emit('delete-company', company._id)"
            )
              Trash2(:size="14", :stroke-width="1.75")
        tr(v-if="!companies.length")
          td.kl-muted.empty-row(colspan="4") No companies yet.
</template>
