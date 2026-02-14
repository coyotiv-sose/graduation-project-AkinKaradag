var express = require('express')
var router = express.Router()
var employeeManager = require('../managers/employee-manager')

router.get('/:employeeId', async(req, res, next) => {
    try{
        const employee = await employeeManager.getEmployeeById(req.params.employeeId)
        res.status(200).json(employee)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})