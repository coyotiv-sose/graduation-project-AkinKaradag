const { Joi } = require('celebrate')

const { ORDER_STATES, TOUR_STATES, VEHICLE_STATES } = require('../domain-constants')

const objectIdSchema = Joi.string().pattern(/^[0-9a-fA-F]{24}$/)

const nonEmptyStringSchema = Joi.string().trim().min(1)
const emailSchema = Joi.string().trim().lowercase().email()

const objectIdParamsSchema = (...keys) =>
  Joi.object(Object.fromEntries(keys.map(key => [key, objectIdSchema.required()]))).required()

module.exports = {
  objectIdSchema,
  objectIdParamsSchema,
  nonEmptyStringSchema,
  emailSchema,
  ORDER_STATES,
  TOUR_STATES,
  VEHICLE_STATES,
}
