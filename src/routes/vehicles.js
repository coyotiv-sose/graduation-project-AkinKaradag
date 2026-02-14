var express = require('express')
var router = express.Router()
var vehicleManager = require('../managers/vehicle-manager')

router.get('/:vehicleId', async(req, res, next) => {
    try{
        const vehicle = vehicleManager.findVehicleById(req.params.vehicleId)
        res.status(200).json(vehicle)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

module.exports = router