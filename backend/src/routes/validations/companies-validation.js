const { Joi } = require('celebrate')

const { PASSWORD_ALLOWED_REGEX, PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } = require('../../lib/password-policy')
const {
  objectIdSchema,
  nonEmptyStringSchema,
  emailSchema,
  TOUR_STATES,
  VEHICLE_STATES,
} = require('../../lib/validation/primitives')
const { createBodySchema, createUpdateBodySchema } = require('../../lib/validation/builders')
const { billingInfoSchema, orderBaseBodyFields } = require('../../lib/validation/shared-schemas')
const { validateParams, validateParamsAndBody } = require('../../lib/validation/celebrate-builders')

const orderCreateByCompanyBodySchema = createBodySchema({ ...orderBaseBodyFields, customer: objectIdSchema }, [
  'origin',
  'destination',
  'deliveryDate',
  'customer',
  'cargos',
  'billingInfo',
])

const passwordSchema = Joi.string().min(PASSWORD_MIN_LENGTH).max(PASSWORD_MAX_LENGTH).pattern(PASSWORD_ALLOWED_REGEX)

const customerBodyFields = {
  customerName: nonEmptyStringSchema,
  email: emailSchema,
  billingInfo: Joi.array().items(billingInfoSchema),
  profile: nonEmptyStringSchema,
}

const customerCreateBodySchema = createBodySchema({ ...customerBodyFields, password: passwordSchema }, [
  'customerName',
  'email',
  'password',
])
const customerUpdateBodySchema = createUpdateBodySchema(customerBodyFields)

const employeeBodyFields = {
  name: nonEmptyStringSchema,
  email: emailSchema,
  profile: nonEmptyStringSchema,
}

const employeeCreateBodySchema = createBodySchema({ ...employeeBodyFields, password: passwordSchema }, [
  'name',
  'email',
  'password',
])
const employeeUpdateBodySchema = createUpdateBodySchema(employeeBodyFields)

const vehicleBodyFields = {
  name: nonEmptyStringSchema,
  brand: nonEmptyStringSchema,
  model: nonEmptyStringSchema,
  year: Joi.number(),
  payLoad: Joi.number(),
  state: Joi.string().valid(...VEHICLE_STATES),
}

const vehicleCreateBodySchema = createBodySchema(vehicleBodyFields, ['brand', 'model', 'year', 'payLoad'])
const vehicleUpdateBodySchema = createUpdateBodySchema(vehicleBodyFields)

const tourBodyFields = {
  date: Joi.date(),
  startLocation: Joi.string().trim().allow(''),
  endLocation: Joi.string().trim().allow(''),
  orders: Joi.array().items(objectIdSchema),
  state: Joi.string().valid(...TOUR_STATES),
  vehicle: objectIdSchema.allow(null),
}

const tourCreateBodySchema = createBodySchema(tourBodyFields, ['date'])
const tourUpdateBodySchema = createUpdateBodySchema({
  ...tourBodyFields,
  vehicleId: objectIdSchema.allow(null),
}).oxor('vehicle', 'vehicleId')
const tourAddOrderBodySchema = Joi.object({
  orderId: objectIdSchema.required(),
}).required()

const companyPasswordResetBodySchema = Joi.object({
  newPassword: passwordSchema.required(),
}).required()

const validateCompanyIdParam = validateParams('companyId')
const validateCompanyCustomerParams = validateParams('companyId', 'customerId')
const validateCompanyEmployeeParams = validateParams('companyId', 'employeeId')
const validateCompanyOrderParams = validateParams('companyId', 'orderId')
const validateCreateCompanyCustomer = validateParamsAndBody('companyId', customerCreateBodySchema)
const validateUpdateCompanyCustomer = validateParamsAndBody(['companyId', 'customerId'], customerUpdateBodySchema)
const validateCreateCompanyEmployee = validateParamsAndBody('companyId', employeeCreateBodySchema)
const validateUpdateCompanyEmployee = validateParamsAndBody(['companyId', 'employeeId'], employeeUpdateBodySchema)
const validateCreateCompanyOrder = validateParamsAndBody('companyId', orderCreateByCompanyBodySchema)
const validateCreateCompanyVehicle = validateParamsAndBody('companyId', vehicleCreateBodySchema)
const validateUpdateCompanyVehicle = validateParamsAndBody(['companyId', 'vehicleId'], vehicleUpdateBodySchema)
const validateCreateCompanyTour = validateParamsAndBody('companyId', tourCreateBodySchema)
const validateAddOrderToTour = validateParamsAndBody(['companyId', 'tourId'], tourAddOrderBodySchema)
const validateUpdateCompanyTour = validateParamsAndBody(['companyId', 'tourId'], tourUpdateBodySchema)
const validateCompanyCustomerPasswordReset = validateParamsAndBody(
  ['companyId', 'customerId'],
  companyPasswordResetBodySchema
)
const validateCompanyEmployeePasswordReset = validateParamsAndBody(
  ['companyId', 'employeeId'],
  companyPasswordResetBodySchema
)

module.exports = {
  validateCompanyIdParam,
  validateCompanyCustomerParams,
  validateCompanyEmployeeParams,
  validateCompanyOrderParams,
  validateCreateCompanyCustomer,
  validateUpdateCompanyCustomer,
  validateCreateCompanyEmployee,
  validateUpdateCompanyEmployee,
  validateCreateCompanyOrder,
  validateCreateCompanyVehicle,
  validateUpdateCompanyVehicle,
  validateCreateCompanyTour,
  validateAddOrderToTour,
  validateUpdateCompanyTour,
  validateCompanyCustomerPasswordReset,
  validateCompanyEmployeePasswordReset,
}
