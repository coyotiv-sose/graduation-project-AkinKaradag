const { Joi } = require('celebrate')

const objectIdPattern = /^[0-9a-fA-F]{24}$/
const objectIdSchema = Joi.string().pattern(objectIdPattern)

const ORDER_STATES = ['PENDING', 'IN_PROCESS', 'DELIVERED']
const TOUR_STATES = ['STARTED', 'PLANNED', 'CANCELLED', 'FINISHED']
const VEHICLE_STATES = ['AVAILABLE', 'ON_TOUR', 'IN_GARAGE', 'DAMAGED', 'PARKED', 'SOLD', 'OTHER_REASON']

const nonEmptyStringSchema = Joi.string().trim().min(1)
const emailSchema = Joi.string().trim().lowercase().email()

const objectIdParamsSchema = (...keys) =>
  Joi.object(Object.fromEntries(keys.map(key => [key, objectIdSchema.required()]))).required()

module.exports = {
  objectIdPattern,
  objectIdSchema,
  objectIdParamsSchema,
  nonEmptyStringSchema,
  emailSchema,
  ORDER_STATES,
  TOUR_STATES,
  VEHICLE_STATES,
}
