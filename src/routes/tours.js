const express = require('express')
const router = express.Router()
const tourManager = require('../managers/tour-manager')
const vehicleManager = require('../managers/vehicle-manager')

router.get('/:tourId', async(req, res, next) => {
    try {
        const tour = await tourManager.findTourById(req.params.tourId)
        res.status(200).json(tour)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

router.get('/:tourId/cargos', async(req, res, next) => {
    try {
        const cargos = await tourManager.getCargosByTour(req.params.tourId)
        res.status(200).json(cargos)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

router.put('/:tourId/assign-vehicles', async(req, res, next) => {
    try {
        const tour = await tourManager.findTourById(req.params.tourId)
        const vehicle = await vehicleManager.findVehicleById(req.body.vehicleId)
        if (vehicle.status !== 'AVAILABLE') {
            throw new Error('Vehicle is not available')
        }
        await tour.assignVehicle(vehicle)
        res.status(200).json(tour)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
})

module.exports = router