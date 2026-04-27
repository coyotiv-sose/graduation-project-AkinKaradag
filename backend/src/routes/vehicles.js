const express = require('express')

const router = express.Router()
const requireRole = require('../middlewares/require-role')
const { requireVehicleAccess } = require('../middlewares/require-access')
const { validateVehicleIdParam } = require('./validations/vehicles-validation')

router.use(requireRole('admin', 'employee'))

router.get('/:vehicleId', validateVehicleIdParam, requireVehicleAccess(), (req, res) => {
  res.status(200).json(req.authz?.vehicle)
})

module.exports = router
