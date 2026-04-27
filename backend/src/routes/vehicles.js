const express = require('express')

const router = express.Router()
const vehicleManager = require('../managers/vehicle-manager')
const { validateVehicleIdParam } = require('./validations/vehicles-validation')

router.get('/:vehicleId', validateVehicleIdParam, async (req, res, next) => {
  try {
    const vehicle = await vehicleManager.findVehicleById(req.params.vehicleId)
    res.status(200).json(vehicle)
  } catch (error) {
    next(error)
  }
})

module.exports = router
