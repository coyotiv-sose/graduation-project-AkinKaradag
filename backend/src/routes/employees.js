const express = require('express')

const router = express.Router()
const requireRole = require('../middlewares/require-role')
const { requireEmployeeAccess } = require('../middlewares/require-access')
const { validateEmployeeIdParam } = require('./validations/employees-validation')

router.use(requireRole('admin', 'employee'))

router.get('/:employeeId', validateEmployeeIdParam, requireEmployeeAccess(), (req, res) => {
  res.status(200).json(req.authz?.employee)
})

module.exports = router
