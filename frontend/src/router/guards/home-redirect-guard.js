import { useAccountStore } from '../../stores/account-store'

export function homeRedirectGuard(to) {
    if (to.name !== 'home') return true

    const accountStore = useAccountStore()
    if (!accountStore.isLoggedIn) return true

    if (accountStore.isCustomer) {
        return { name: 'orderList' }
    }
    if (accountStore.isEmployee && accountStore.companyId) {
        return { name: 'dispatcher', params: { companyId: accountStore.companyId } }
    }
    if (accountStore.isAdmin) {
        return { name: 'admin' }
    }

    return true
}
