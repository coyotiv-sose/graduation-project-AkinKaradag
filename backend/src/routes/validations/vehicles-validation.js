const { validateParams } = require('../../lib/validation/celebrate-builders')

const validateVehicleIdParam = validateParams('vehicleId')

module.exports = {
  validateVehicleIdParam,
}
