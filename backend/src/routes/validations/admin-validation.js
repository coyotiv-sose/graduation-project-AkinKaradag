const { Joi } = require('celebrate')

const { PASSWORD_ALLOWED_REGEX, PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } = require('../../lib/password-policy')
const { objectIdSchema, nonEmptyStringSchema, emailSchema } = require('../../lib/validation/primitives')
const {
  createBodySchema,
  createUpdateBodySchema,
  createCompanyScopedBodySchema,
} = require('../../lib/validation/builders')
const { billingInfoSchema, orderUpdateBodySchema } = require('../../lib/validation/shared-schemas')
const { validateParams, validateBody, validateParamsAndBody } = require('../../lib/validation/celebrate-builders')

const companyScopedDeleteBodySchema = Joi.object({
  company: objectIdSchema.required(),
}).required()

const passwordSchema = Joi.string()
  .min(PASSWORD_MIN_LENGTH)
  .max(PASSWORD_MAX_LENGTH)
  .pattern(PASSWORD_ALLOWED_REGEX)

const companyBodyFields = {
  companyName: nonEmptyStringSchema,
  address: nonEmptyStringSchema,
  postalCode: nonEmptyStringSchema,
  city: nonEmptyStringSchema,
}

const companyCreateBodySchema = createBodySchema(
  {
    ...companyBodyFields,
    ownerName: nonEmptyStringSchema,
    ownerEmail: emailSchema,
    ownerPassword: passwordSchema,
  },
  ['companyName', 'address', 'postalCode', 'city']
)
const companyUpdateBodySchema = createUpdateBodySchema(companyBodyFields)

const customerBodyFields = {
  customerName: nonEmptyStringSchema,
  email: emailSchema,
  billingInfo: Joi.array().items(billingInfoSchema),
  profile: nonEmptyStringSchema,
}
const customerUpdateByAdminBodySchema = createCompanyScopedBodySchema(customerBodyFields)

const employeeBodyFields = {
  name: nonEmptyStringSchema,
  email: emailSchema,
  profile: nonEmptyStringSchema,
}
const employeeUpdateByAdminBodySchema = createCompanyScopedBodySchema(employeeBodyFields)

const adminPasswordResetBodySchema = Joi.object({
  company: objectIdSchema.required(),
  newPassword: passwordSchema.required(),
}).required()

const validateCompanyIdParam = validateParams('companyId')
const validateAdminCompanyCreate = validateBody(companyCreateBodySchema)
const validateAdminCompanyUpdate = validateParamsAndBody('companyId', companyUpdateBodySchema)
const validateAdminCustomerUpdate = validateParamsAndBody('customerId', customerUpdateByAdminBodySchema)
const validateAdminCustomerDelete = validateParamsAndBody('customerId', companyScopedDeleteBodySchema)
const validateAdminOrderUpdate = validateParamsAndBody('orderId', orderUpdateBodySchema)
const validateAdminOrderDelete = validateParamsAndBody('orderId', companyScopedDeleteBodySchema)
const validateAdminEmployeeUpdate = validateParamsAndBody('employeeId', employeeUpdateByAdminBodySchema)
const validateAdminEmployeeDelete = validateParamsAndBody('employeeId', companyScopedDeleteBodySchema)
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
