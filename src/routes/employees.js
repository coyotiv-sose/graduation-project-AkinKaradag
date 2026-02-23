const express = require('express')

const router = express.Router()
const employeeManager = require('../managers/employee-manager')

router.get('/:employeeId', async (req, res, next) => {
  try {
    const employee = await employeeManager.getEmployeeById(req.params.employeeId)
    res.status(200).json(employee)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router
