const { validateParams } = require('./builders')

const validateVehicleIdParam = validateParams('vehicleId')

module.exports = {
  validateVehicleIdParam,
}
