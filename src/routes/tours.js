const express = require('express')
const router = express.Router()
const tourManager = require('../managers/tour-manager')

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

module.exports = router