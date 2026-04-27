const { Joi } = require('celebrate')

const { nonEmptyStringSchema, VEHICLE_STATES } = require('../primitives')
const { createBodySchema, createUpdateBodySchema } = require('../builders')

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

module.exports = {
  vehicleBodyFields,
  vehicleCreateBodySchema,
  vehicleUpdateBodySchema,
}
