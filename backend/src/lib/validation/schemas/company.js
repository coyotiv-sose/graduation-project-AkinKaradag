const { Joi } = require('celebrate')

const { nonEmptyStringSchema, emailSchema } = require('../primitives')
const { createBodySchema, createUpdateBodySchema } = require('../builders')

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
    ownerPassword: Joi.string().min(1),
  },
  ['companyName', 'address', 'postalCode', 'city']
)

const companyUpdateBodySchema = createUpdateBodySchema(companyBodyFields)

module.exports = {
  companyBodyFields,
  companyCreateBodySchema,
  companyUpdateBodySchema,
}
