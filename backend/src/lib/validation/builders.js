const { Joi } = require('celebrate')

const { objectIdSchema } = require('./primitives')

const createBodySchema = (fields, requiredKeys = []) => {
  const requiredKeySet = new Set(requiredKeys)

  return Joi.object(
    Object.fromEntries(
      Object.entries(fields).map(([key, schema]) => [key, requiredKeySet.has(key) ? schema.required() : schema])
    )
  ).required()
}

const createUpdateBodySchema = fields =>
  Joi.object(fields)
    .or(...Object.keys(fields))
    .unknown(true)
    .required()

const createCompanyScopedBodySchema = fields =>
  Joi.object({
    company: objectIdSchema.required(),
    ...fields,
  })
    .unknown(true)
    .required()

module.exports = {
  createBodySchema,
  createUpdateBodySchema,
  createCompanyScopedBodySchema,
}
