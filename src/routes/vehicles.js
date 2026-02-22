const express = require('express')

const router = express.Router()
const vehicleManager = require('../managers/vehicle-manager')

router.get('/:vehicleId', async (req, res, next) => {
  try {
    const vehicle = await vehicleManager.findVehicleById(req.params.vehicleId)
    res.status(200).json(vehicle)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router
