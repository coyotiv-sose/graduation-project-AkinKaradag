const customerManager = require('../managers/customer-manager')
const employeeManager = require('../managers/employee-manager')
const orderManager = require('../managers/order-manager')
const tourManager = require('../managers/tour-manager')
const vehicleManager = require('../managers/vehicle-manager')
const {
  idsEqual,
  resolveAccountScope,
  canAccessCompany,
  canAccessCustomer,
  canAccessEmployee,
  canAccessOrder,
  canAccessVehicle,
  canAccessTour,
  isResourceInCompany,
} = require('../lib/access-control')
const { ACTOR_PROFILE_NOT_FOUND_ERROR_CODES } = require('../lib/authz-error-codes')
const { attachErrorStatus, NOT_FOUND_ERROR_PATTERN } = require('../lib/route-error-forwarding')
const { DomainError } = require('../lib/domain-error')

const ACTOR_SCOPE_KEY = Symbol('actorScope')
const RESOURCE_CACHE_KEY = Symbol('resourceCache')
const ACTOR_SCOPE_RESOLUTION_ERROR_CODE = 'AUTHZ_ACTOR_SCOPE_RESOLUTION'
const ACTOR_PROFILE_NOT_FOUND_CODE_SET = new Set(Object.values(ACTOR_PROFILE_NOT_FOUND_ERROR_CODES))
const RESOURCE_LABELS = {
  customer: 'Customer',
  employee: 'Employee',
  order: 'Order',
  vehicle: 'Vehicle',
  tour: 'Tour',
}

const forbiddenError = () => new DomainError('Forbidden', { status: 403 })

const createResourceNotFoundError = resourceType => {
  const label = RESOURCE_LABELS[resourceType] || 'Resource'
  return new DomainError(`${label} not found`, { status: 404 })
}

const isActorProfileResolutionError = error => Boolean(error && ACTOR_PROFILE_NOT_FOUND_CODE_SET.has(error.code))

const normalizeAccessError = error => {
  if (!error) return error

  if (error.code === ACTOR_SCOPE_RESOLUTION_ERROR_CODE) {
    return new DomainError('Forbidden', { status: 403, code: error.code })
  }

  if (error.name === 'CastError') {
    return attachErrorStatus(error, 400)
  }

  if (NOT_FOUND_ERROR_PATTERN.test(error.message || '')) {
    return attachErrorStatus(error, 404)
  }

  return error
}

const withAuthzErrorHandling = handler => async (req, res, next) => {
  try {
    return await handler(req, res, next)
  } catch (error) {
    return next(normalizeAccessError(error))
  }
}

const getActorScope = async req => {
  if (req[ACTOR_SCOPE_KEY]) return req[ACTOR_SCOPE_KEY]

  let actorScope

  try {
    actorScope = await resolveAccountScope(req.user, {
      customerManager,
      employeeManager,
    })
  } catch (error) {
    // A customer/employee account exists but the linked profile is missing → treat as 403.
    if (isActorProfileResolutionError(error)) {
      error.code = ACTOR_SCOPE_RESOLUTION_ERROR_CODE
      throw attachErrorStatus(error, 403)
    }
    throw error
  }

  req[ACTOR_SCOPE_KEY] = actorScope
  return actorScope
}

const getResourceCache = req => {
  if (!req[RESOURCE_CACHE_KEY]) req[RESOURCE_CACHE_KEY] = {}
  return req[RESOURCE_CACHE_KEY]
}

const loadCachedResource = async (req, type, id, loader) => {
  const cache = getResourceCache(req)
  const key = `${type}:${id}`

  if (Object.prototype.hasOwnProperty.call(cache, key)) return cache[key]

  const resource = await loader()
  cache[key] = resource
  return resource
}

const resolveBodyResourceId = (body, fields) => {
  const targetField = fields.find(field => Object.prototype.hasOwnProperty.call(body || {}, field))
  if (!targetField) return undefined
  return body[targetField]
}

const storeAuthorizedResource = (req, key, resource) => {
  req.authz = req.authz || {}
  req.authz[key] = resource
}

const requireScopedResourceAccess = ({
  resourceType,
  resourceParamName,
  companyParamName,
  loadResource,
  canAccessResource,
  storeKey,
  additionalCheck,
}) =>
  withAuthzErrorHandling(async (req, res, next) => {
    const actorScope = await getActorScope(req)
    const resourceId = req.params[resourceParamName]

    const resource = await loadCachedResource(req, resourceType, resourceId, () => loadResource(resourceId))
    if (!resource) throw createResourceNotFoundError(resourceType)

    if (!canAccessResource(actorScope, resource)) {
      throw forbiddenError()
    }

    if (companyParamName && !isResourceInCompany(resource, req.params[companyParamName])) {
      throw forbiddenError()
    }

    if (additionalCheck && !additionalCheck(resource, req)) {
      throw forbiddenError()
    }

    storeAuthorizedResource(req, storeKey, resource)
    return next()
  })

const requireBodyResourceInCompany = ({
  resourceType,
  bodyField,
  bodyFields,
  companyParamName = 'companyId',
  loadResource,
  storeKey,
}) =>
  withAuthzErrorHandling(async (req, res, next) => {
    const targetBodyFields = (Array.isArray(bodyFields) ? bodyFields : [bodyField]).filter(Boolean)
    const resourceId = resolveBodyResourceId(req.body, targetBodyFields)

    // Optional body fields: skip authorization when the field is absent.
    if (!resourceId) return next()

    const resource = await loadCachedResource(req, resourceType, resourceId, () => loadResource(resourceId))
    if (!resource) throw createResourceNotFoundError(resourceType)

    if (!isResourceInCompany(resource, req.params[companyParamName])) {
      throw forbiddenError()
    }

    storeAuthorizedResource(req, storeKey, resource)
    return next()
  })

const requireCompanyAccess = (companyParamName = 'companyId') =>
  withAuthzErrorHandling(async (req, res, next) => {
    const actorScope = await getActorScope(req)

    if (!canAccessCompany(actorScope, req.params[companyParamName])) {
      throw forbiddenError()
    }

    return next()
  })

const requireCustomerAccess = ({ customerParamName = 'customerId', companyParamName } = {}) =>
  requireScopedResourceAccess({
    resourceType: 'customer',
    resourceParamName: customerParamName,
    companyParamName,
    loadResource: customerId => customerManager.getCustomerById(customerId),
    canAccessResource: canAccessCustomer,
    storeKey: 'customer',
  })

const requireEmployeeAccess = ({ employeeParamName = 'employeeId', companyParamName } = {}) =>
  requireScopedResourceAccess({
    resourceType: 'employee',
    resourceParamName: employeeParamName,
    companyParamName,
    loadResource: employeeId => employeeManager.getEmployeeById(employeeId),
    canAccessResource: canAccessEmployee,
    storeKey: 'employee',
  })

const requireOrderAccess = ({ orderParamName = 'orderId', companyParamName, customerParamName } = {}) =>
  requireScopedResourceAccess({
    resourceType: 'order',
    resourceParamName: orderParamName,
    companyParamName,
    loadResource: orderId => orderManager.findOrderById(orderId),
    canAccessResource: canAccessOrder,
    storeKey: 'order',
    additionalCheck: (order, req) => !customerParamName || idsEqual(order.customer, req.params[customerParamName]),
  })

const requireVehicleAccess = ({ vehicleParamName = 'vehicleId', companyParamName } = {}) =>
  requireScopedResourceAccess({
    resourceType: 'vehicle',
    resourceParamName: vehicleParamName,
    companyParamName,
    loadResource: vehicleId => vehicleManager.findVehicleById(vehicleId),
    canAccessResource: canAccessVehicle,
    storeKey: 'vehicle',
  })

const requireTourAccess = ({ tourParamName = 'tourId', companyParamName } = {}) =>
  requireScopedResourceAccess({
    resourceType: 'tour',
    resourceParamName: tourParamName,
    companyParamName,
    loadResource: tourId => tourManager.findTourById(tourId),
    canAccessResource: canAccessTour,
    storeKey: 'tour',
  })

const requireBodyCustomerInCompany = ({
  customerField = 'customer',
  customerFields,
  companyParamName = 'companyId',
} = {}) =>
  requireBodyResourceInCompany({
    resourceType: 'customer',
    bodyField: customerField,
    bodyFields: customerFields,
    companyParamName,
    loadResource: customerId => customerManager.getCustomerById(customerId),
    storeKey: 'requestCustomer',
  })

const requireBodyOrderInCompany = ({ orderField = 'orderId', orderFields, companyParamName = 'companyId' } = {}) =>
  requireBodyResourceInCompany({
    resourceType: 'order',
    bodyField: orderField,
    bodyFields: orderFields,
    companyParamName,
    loadResource: orderId => orderManager.findOrderById(orderId),
    storeKey: 'requestOrder',
  })

const requireBodyVehicleInCompany = ({
  vehicleField = 'vehicle',
  vehicleFields,
  companyParamName = 'companyId',
} = {}) =>
  requireBodyResourceInCompany({
    resourceType: 'vehicle',
    bodyField: vehicleField,
    bodyFields: vehicleFields,
    companyParamName,
    loadResource: vehicleId => vehicleManager.findVehicleById(vehicleId),
    storeKey: 'requestVehicle',
  })

module.exports = {
  getActorScope,
  requireCompanyAccess,
  requireCustomerAccess,
  requireEmployeeAccess,
  requireOrderAccess,
  requireVehicleAccess,
  requireTourAccess,
  requireBodyCustomerInCompany,
  requireBodyOrderInCompany,
  requireBodyVehicleInCompany,
}
