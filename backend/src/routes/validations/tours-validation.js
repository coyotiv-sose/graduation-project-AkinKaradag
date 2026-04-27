const { tourAssignVehicleBodySchema } = require('../../lib/validation/schemas/tour')
const { validateParams, validateParamsAndBody } = require('../../lib/validation/celebrate-builders')

const validateTourIdParam = validateParams('tourId')
const validateAssignVehicleToTour = validateParamsAndBody('tourId', tourAssignVehicleBodySchema)

module.exports = {
  validateTourIdParam,
  validateAssignVehicleToTour,
}
