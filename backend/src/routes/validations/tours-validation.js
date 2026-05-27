const { Joi } = require('celebrate')

const { objectIdSchema } = require('../../lib/validation/primitives')
const { validateParams, validateParamsAndBody } = require('../../lib/validation/celebrate-builders')

const tourAssignVehicleBodySchema = Joi.object({
  vehicleId: objectIdSchema.required(),
}).required()

const validateTourIdParam = validateParams('tourId')
const validateAssignVehicleToTour = validateParamsAndBody('tourId', tourAssignVehicleBodySchema)

module.exports = {
  validateTourIdParam,
  validateAssignVehicleToTour,
}
