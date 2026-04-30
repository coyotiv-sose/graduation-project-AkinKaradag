<script>
import { Plus, Pencil, Trash2 } from 'lucide-vue-next'

export default {
  name: 'AdminDashboardCompanyTab',
  components: { Plus, Pencil, Trash2 },
  props: {
    companies: { type: Array, default: () => [] },
    showCompanyForm: { type: Boolean, default: false },
    editingCompany: { type: [String, Number], default: null },
    companyForm: { type: Object, required: true },
    isLoading: { type: Boolean, default: false },
  },
  emits: ['open-create', 'edit-company', 'submit-company', 'cancel-form', 'delete-company', 'update-form'],
  methods: {
    updateField(key, value) {
      this.$emit('update-form', { ...this.companyForm, [key]: value })
    },
  },
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
  .inline-form(v-if="showCompanyForm")
    form(@submit.prevent="$emit('submit-company')")
      h3.inline-form__title {{ editingCompany ? 'Edit company' : 'New company' }}
      .kl-form-row(style="--cols: 1")
        .kl-field
          label.kl-label Company name
          input.kl-input(
            :value="companyForm.companyName"
            @input="updateField('companyName', $event.target.value)"
            required
          )
        .kl-field
          label.kl-label Address
          input.kl-input(
            :value="companyForm.address"
            @input="updateField('address', $event.target.value)"
            required
          )
      .kl-form-row
        .kl-field
          label.kl-label Postal code
          input.kl-input(
            :value="companyForm.postalCode"
            @input="updateField('postalCode', $event.target.value)"
            required
          )
        .kl-field
          label.kl-label City
          input.kl-input(
            :value="companyForm.city"
            @input="updateField('city', $event.target.value)"
            required
          )
      template(v-if="!editingCompany")
        .kl-divider
        p.kl-muted.inline-form__hint Optional: create an initial dispatcher account for this company.
        .kl-form-row(style="--cols: 1")
          .kl-field
            label.kl-label Owner name
            input.kl-input(
              :value="companyForm.ownerName"
              @input="updateField('ownerName', $event.target.value)"
            )
        .kl-form-row
          .kl-field
            label.kl-label Owner email
            input.kl-input(
              :value="companyForm.ownerEmail"
              @input="updateField('ownerEmail', $event.target.value)"
              type="email"
            )
          .kl-field
            label.kl-label Initial password
            input.kl-input(
              :value="companyForm.ownerPassword"
              @input="updateField('ownerPassword', $event.target.value)"
              type="password"
              minlength="6"
            )
      .inline-form__actions
        button.kl-btn.kl-btn--primary(type="submit", :disabled="isLoading")
          | {{ editingCompany ? 'Save' : 'Create' }}
        button.kl-btn.kl-btn--ghost(type="button", @click="$emit('cancel-form')") Cancel
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