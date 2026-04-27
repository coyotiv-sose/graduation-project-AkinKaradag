const express = require('express')

const router = express.Router()
const tourManager = require('../managers/tour-manager')
const { validateTourIdParam, validateAssignVehicleToTour } = require('./validations/tours-validation')

router.get('/:tourId', validateTourIdParam, async (req, res, next) => {
  try {
    const tour = await tourManager.findTourById(req.params.tourId)
    res.status(200).json(tour)
  } catch (error) {
    next(error)
  }
})

router.get('/:tourId/cargos', validateTourIdParam, async (req, res, next) => {
  try {
    const cargos = await tourManager.getCargosByTour(req.params.tourId)
    res.status(200).json(cargos)
  } catch (error) {
    next(error)
  }
})

router.put('/:tourId/vehicles', validateAssignVehicleToTour, async (req, res, next) => {
  try {
    const tour = await tourManager.assignVehicleToTour(req.params.tourId, req.body.vehicleId)
    res.status(200).json(tour)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

module.exports = router
