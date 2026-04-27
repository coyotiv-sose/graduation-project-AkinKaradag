const { Joi } = require('celebrate')

const { PASSWORD_ALLOWED_REGEX, PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } = require('../../lib/password-policy')
const {
  objectIdSchema,
  companyCreateBodySchema,
  companyUpdateBodySchema,
  customerUpdateByAdminBodySchema,
  employeeUpdateByAdminBodySchema,
  orderUpdateBodySchema,
  orderDeleteByAdminBodySchema,
} = require('../../lib/request-validation')
const { validateParams, validateBody, validateParamsAndBody } = require('./builders')

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
