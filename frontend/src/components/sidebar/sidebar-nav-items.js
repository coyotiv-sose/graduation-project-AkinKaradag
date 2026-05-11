export function buildSidebarNavItems({ user, isCustomer, isEmployee, isAdmin, companyId }) {
  const items = [{ to: '/', label: 'Home', icon: 'Home' }]

  if (!user) {
    items.push({ to: '/login', label: 'Sign in', icon: 'LogIn' })
    return items
  }

  if (isCustomer) {
    items.push(
      { to: '/orders/new', label: 'New order', icon: 'PlusCircle' },
      { to: '/orders', label: 'My orders', icon: 'Package' },
    )
  }

  if (isEmployee && companyId) {
    items.push(
      {
        to: `/companies/${companyId}/dispatcher`,
        label: 'Dispatcher',
        icon: 'LayoutDashboard',
      },
      { to: '/orders/new', label: 'New order', icon: 'PlusCircle' },
      { to: `/companies/${companyId}/orders`, label: 'Orders', icon: 'Package' },
      { to: `/companies/${companyId}/vehicles`, label: 'Vehicles', icon: 'Truck' },
      { to: `/companies/${companyId}`, label: 'Company', icon: 'Building2' },
    )
  }

  if (isAdmin) {
    items.push(
      { to: '/admin', label: 'Admin', icon: 'ShieldCheck' },
      { to: '/orders/new', label: 'New order', icon: 'PlusCircle' },
      { to: '/companies', label: 'Companies', icon: 'Building2' },
    )
  }

  return items
}
