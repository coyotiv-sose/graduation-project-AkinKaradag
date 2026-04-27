const express = require('express')

const router = express.Router()
const tourManager = require('../managers/tour-manager')
const { forwardRouteError } = require('../lib/route-error-forwarding')
const requireRole = require('../middlewares/require-role')
const { requireTourAccess } = require('../middlewares/require-access')
const { validateTourIdParam, validateAssignVehicleToTour } = require('./validations/tours-validation')

const tourAccess = requireTourAccess()

router.use(requireRole('admin', 'employee'))

router.get('/:tourId', validateTourIdParam, tourAccess, async (req, res, next) => {
  try {
    const tour = req.authz?.tour
    res.status(200).json(tour)
  } catch (error) {
    next(error)
  }
})

router.get('/:tourId/cargos', validateTourIdParam, tourAccess, async (req, res, next) => {
  try {
    const cargos = await tourManager.getCargosByTour(req.params.tourId)
    res.status(200).json(cargos)
  } catch (error) {
    next(error)
  }
})

router.put('/:tourId/vehicles', validateAssignVehicleToTour, tourAccess, async (req, res, next) => {
  try {
    const tour = await tourManager.assignVehicleToTour(req.params.tourId, req.body.vehicleId)
    return res.status(200).json(tour)
  } catch (error) {
    return forwardRouteError(next, error, 400)
  }
})

module.exports = router
