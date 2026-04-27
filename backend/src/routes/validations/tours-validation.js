const { tourAssignVehicleBodySchema } = require('../../lib/request-validation')
const { validateParams, validateParamsAndBody } = require('./builders')

const validateTourIdParam = validateParams('tourId')
const validateAssignVehicleToTour = validateParamsAndBody('tourId', tourAssignVehicleBodySchema)

module.exports = {
  validateTourIdParam,
  validateAssignVehicleToTour,
}
