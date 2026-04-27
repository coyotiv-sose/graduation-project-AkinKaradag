const { Joi } = require('celebrate')

const { PASSWORD_ALLOWED_REGEX, PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } = require('../../lib/password-policy')
const { customerCreateBodySchema, customerUpdateBodySchema } = require('../../lib/validation/schemas/customer')
const { employeeCreateBodySchema, employeeUpdateBodySchema } = require('../../lib/validation/schemas/employee')
const { orderCreateByCompanyBodySchema } = require('../../lib/validation/schemas/order')
const { vehicleCreateBodySchema, vehicleUpdateBodySchema } = require('../../lib/validation/schemas/vehicle')
const {
  tourCreateBodySchema,
  tourUpdateBodySchema,
  tourAddOrderBodySchema,
} = require('../../lib/validation/schemas/tour')
const { validateParams, validateParamsAndBody } = require('../../lib/validation/celebrate-builders')

const companyPasswordResetBodySchema = Joi.object({
  newPassword: Joi.string()
    .min(PASSWORD_MIN_LENGTH)
    .max(PASSWORD_MAX_LENGTH)
    .pattern(PASSWORD_ALLOWED_REGEX)
    .required(),
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
