const { Joi } = require('celebrate')

const { nonEmptyStringSchema, emailSchema } = require('../primitives')
const { createBodySchema, createUpdateBodySchema, createCompanyScopedBodySchema } = require('../builders')

const employeeBodyFields = {
  name: nonEmptyStringSchema,
  email: emailSchema,
  profile: nonEmptyStringSchema,
}

const employeeCreateBodySchema = createBodySchema(
  {
    ...employeeBodyFields,
    password: Joi.string().min(1),
  },
  ['name', 'email', 'password']
)

const employeeUpdateBodySchema = createUpdateBodySchema(employeeBodyFields)

const employeeUpdateByAdminBodySchema = createCompanyScopedBodySchema(employeeBodyFields)

module.exports = {
  employeeBodyFields,
  employeeCreateBodySchema,
  employeeUpdateBodySchema,
  employeeUpdateByAdminBodySchema,
}
