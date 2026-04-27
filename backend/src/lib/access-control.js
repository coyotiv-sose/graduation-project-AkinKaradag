const getEntityId = value => {
  if (value === null || value === undefined) return null

  if (typeof value === 'string' || typeof value === 'number') {
    return String(value)
  }

  if (typeof value === 'object' && value._id !== undefined) {
    return getEntityId(value._id)
  }

  if (typeof value === 'object' && typeof value.toHexString === 'function') {
    return value.toHexString()
  }

  if (typeof value === 'object' && typeof value.valueOf === 'function') {
    const resolvedValue = value.valueOf()
    if (resolvedValue !== value) return getEntityId(resolvedValue)
  }

  return null
}

const idsEqual = (left, right) => {
  const leftId = getEntityId(left)
  const rightId = getEntityId(right)
  return Boolean(leftId && rightId && leftId === rightId)
}

const requireScopeManager = (managers, managerName, roleName) => {
  if (!managers[managerName]) {
    throw new Error(`${roleName} manager is required for ${roleName} scope resolution`)
  }

  return managers[managerName]
}

const resolveCustomerScope = async (account, managers) => {
  const customerManager = requireScopeManager(managers, 'customerManager', 'Customer')
  const customer = await customerManager.getCustomerByAccountId(account._id)
  return {
    customerId: getEntityId(customer._id),
    companyId: getEntityId(customer.company),
  }
}

const resolveEmployeeScope = async (account, managers) => {
  const employeeManager = requireScopeManager(managers, 'employeeManager', 'Employee')
  const employee = await employeeManager.getEmployeeByAccountId(account._id)
  return {
    employeeId: getEntityId(employee._id),
    companyId: getEntityId(employee.company),
  }
}

const ROLE_SCOPE_RESOLVERS = {
  customer: resolveCustomerScope,
  employee: resolveEmployeeScope,
}

const resolveAccountScope = async (account, managers = {}) => {
  if (!account) return null

  const scope = {
    role: account.role,
    accountId: getEntityId(account._id),
  }

  const resolver = ROLE_SCOPE_RESOLVERS[account.role]
  if (!resolver) return scope

  const roleScope = await resolver(account, managers)
  return {
    ...scope,
    ...roleScope,
  }
}

const canAccessByRole = (scope, roleAccessChecks = {}) => {
  if (!scope) return false
  if (scope.role === 'admin') return true

  const roleCheck = roleAccessChecks[scope.role]
  return typeof roleCheck === 'function' ? roleCheck(scope) : false
}

const canAccessCompany = (scope, companyId) =>
  canAccessByRole(scope, {
    employee: actorScope => idsEqual(actorScope.companyId, companyId),
  })

const canAccessCustomer = (scope, customer) =>
  canAccessByRole(scope, {
    customer: actorScope => idsEqual(actorScope.customerId, customer?._id),
    employee: actorScope => idsEqual(actorScope.companyId, customer?.company),
  })

const canAccessEmployee = (scope, employee) =>
  canAccessByRole(scope, {
    employee: actorScope => idsEqual(actorScope.companyId, employee?.company),
  })

const canAccessOrder = (scope, order) =>
  canAccessByRole(scope, {
    customer: actorScope => idsEqual(actorScope.customerId, order?.customer),
    employee: actorScope => idsEqual(actorScope.companyId, order?.company),
  })

const canAccessVehicle = (scope, vehicle) =>
  canAccessByRole(scope, {
    employee: actorScope => idsEqual(actorScope.companyId, vehicle?.company),
  })

const canAccessTour = (scope, tour) =>
  canAccessByRole(scope, {
    employee: actorScope => idsEqual(actorScope.companyId, tour?.company),
  })

const isResourceInCompany = (resource, companyId) => idsEqual(resource?.company, companyId)

module.exports = {
  getEntityId,
  idsEqual,
  resolveAccountScope,
  canAccessCompany,
  canAccessCustomer,
  canAccessEmployee,
  canAccessOrder,
  canAccessVehicle,
  canAccessTour,
  isResourceInCompany,
}
