<script>
export default {
  name: 'CreateFormWrapper',
  props: {
    submitLabel: {
      type: String,
      default: 'Create',
    },
    onSubmit: {
      type: Function,
      required: true,
    },
  },
  data() {
    return {
      isLoading: false,
      errorMessage: '',
    }
  },
  methods: {
    async handleSubmit() {
      this.isLoading = true
      this.errorMessage = ''
      try {
        await this.onSubmit()
      } catch (e) {
        this.errorMessage = ('Something went wrong', e)
      } finally {
        this.isLoading = false
      }
    },
  },
}
</script>

<template lang="pug">
form(@submit.prevent='handleSubmit')
  slot
  button(type='submit', :disabled='isLoading') {{ submitLabel }}
  p(v-if='errorMessage') {{ errorMessage }}
</template>
