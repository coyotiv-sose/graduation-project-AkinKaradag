const { Joi } = require('celebrate')

const { objectIdSchema, TOUR_STATES } = require('../primitives')
const { createBodySchema, createUpdateBodySchema } = require('../builders')

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

const tourAssignVehicleBodySchema = Joi.object({
  vehicleId: objectIdSchema.required(),
}).required()

module.exports = {
  tourBodyFields,
  tourCreateBodySchema,
  tourUpdateBodySchema,
  tourAddOrderBodySchema,
  tourAssignVehicleBodySchema,
}
