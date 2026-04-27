const { Joi } = require('celebrate')

const { nonEmptyStringSchema, emailSchema } = require('../primitives')
const { createBodySchema, createUpdateBodySchema, createCompanyScopedBodySchema } = require('../builders')
const { billingInfoSchema } = require('./shared')

const customerBodyFields = {
  customerName: nonEmptyStringSchema,
  email: emailSchema,
  billingInfo: Joi.array().items(billingInfoSchema),
  profile: nonEmptyStringSchema,
}

const customerCreateBodySchema = createBodySchema(
  {
    ...customerBodyFields,
    password: Joi.string().min(1),
  },
  ['customerName', 'email', 'password']
)

const customerUpdateBodySchema = createUpdateBodySchema(customerBodyFields)

const customerUpdateByAdminBodySchema = createCompanyScopedBodySchema(customerBodyFields)

module.exports = {
  customerBodyFields,
  customerCreateBodySchema,
  customerUpdateBodySchema,
  customerUpdateByAdminBodySchema,
}
