const { Joi } = require('celebrate')

const { PASSWORD_ALLOWED_REGEX, PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } = require('../../lib/password-policy')
const { objectIdSchema } = require('../../lib/validation/primitives')
const { companyCreateBodySchema, companyUpdateBodySchema } = require('../../lib/validation/schemas/company')
const { customerUpdateByAdminBodySchema } = require('../../lib/validation/schemas/customer')
const { employeeUpdateByAdminBodySchema } = require('../../lib/validation/schemas/employee')
const { orderUpdateBodySchema, orderDeleteByAdminBodySchema } = require('../../lib/validation/schemas/order')
const { validateParams, validateBody, validateParamsAndBody } = require('../../lib/validation/celebrate-builders')

const adminPasswordResetBodySchema = Joi.object({
  company: objectIdSchema.required(),
  newPassword: Joi.string()
    .min(PASSWORD_MIN_LENGTH)
    .max(PASSWORD_MAX_LENGTH)
    .pattern(PASSWORD_ALLOWED_REGEX)
    .required(),
}).required()

const validateCompanyIdParam = validateParams('companyId')
const validateAdminCompanyCreate = validateBody(companyCreateBodySchema)
const validateAdminCompanyUpdate = validateParamsAndBody('companyId', companyUpdateBodySchema)
const validateAdminCustomerUpdate = validateParamsAndBody('customerId', customerUpdateByAdminBodySchema)
const validateAdminCustomerDelete = validateParamsAndBody('customerId', orderDeleteByAdminBodySchema)
const validateAdminOrderUpdate = validateParamsAndBody('orderId', orderUpdateBodySchema)
const validateAdminOrderDelete = validateParamsAndBody('orderId', orderDeleteByAdminBodySchema)
const validateAdminEmployeeUpdate = validateParamsAndBody('employeeId', employeeUpdateByAdminBodySchema)
const validateAdminEmployeeDelete = validateParamsAndBody('employeeId', orderDeleteByAdminBodySchema)
const validateAdminCustomerPasswordReset = validateParamsAndBody('customerId', adminPasswordResetBodySchema)
const validateAdminEmployeePasswordReset = validateParamsAndBody('employeeId', adminPasswordResetBodySchema)

module.exports = {
  validateCompanyIdParam,
  validateAdminCompanyCreate,
  validateAdminCompanyUpdate,
  validateAdminCustomerUpdate,
  validateAdminCustomerDelete,
  validateAdminOrderUpdate,
  validateAdminOrderDelete,
  validateAdminEmployeeUpdate,
  validateAdminEmployeeDelete,
  validateAdminCustomerPasswordReset,
  validateAdminEmployeePasswordReset,
}
