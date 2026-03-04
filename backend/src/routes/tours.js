const express = require('express')

const router = express.Router()
const tourManager = require('../managers/tour-manager')
const vehicleManager = require('../managers/vehicle-manager')

router.get('/:tourId', async (req, res, next) => {
  try {
    const tour = await tourManager.findTourById(req.params.tourId)
    res.status(200).json(tour)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.get('/:tourId/cargos', async (req, res, next) => {
  try {
    const cargos = await tourManager.getCargosByTour(req.params.tourId)
    res.status(200).json(cargos)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.put('/:tourId/vehicles', async (req, res, next) => {
  try {
    const tour = await tourManager.assignVehicleToTour(req.params.tourId, req.body.vehicleId)
    res.status(200).json(tour)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

module.exports = router
