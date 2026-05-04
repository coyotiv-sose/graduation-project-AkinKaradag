// Host component requirements:
// - Reactive: this.companyId (string) — typically a prop
// - Methods (typically via mapActions from order/vehicle/tour stores):
//   this.getOrdersByCompany, this.getAllVehicles, this.getAllTours
const errorMessageFrom = error => error.response?.data?.error || error.message

export default {
  data() {
    return {
      errorMessage: '',
      isLoading: false,
    }
  },
  methods: {
    async refreshAll() {
      await Promise.all([
        this.getOrdersByCompany(this.companyId),
        this.getAllVehicles(this.companyId),
        this.getAllTours(this.companyId),
      ])
    },
    async loadDispatcherData() {
      this.errorMessage = ''
      this.isLoading = true
      try {
        await this.refreshAll()
      } catch (error) {
        this.errorMessage = errorMessageFrom(error)
      } finally {
        this.isLoading = false
      }
    },
    async withRefresh(action) {
      this.errorMessage = ''
      try {
        const result = await action()
        await this.refreshAll()
        return result
      } catch (error) {
        this.errorMessage = errorMessageFrom(error)
        throw error
      }
    },
  },
}
