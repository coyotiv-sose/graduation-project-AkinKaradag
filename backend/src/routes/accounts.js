const express = require('express')

const passport = require('passport')
const router = express.Router()
const customerManager = require('../managers/customer-manager')
const employeeManager = require('../managers/employee-manager')

router.get('/session', async(req, res, next) => {
    if (!req.user) return res.send(null)
    const response = { ...req.user.toObject() }
    try {
        if (req.user.role === 'customer') {
            const customer = await customerManager.getCustomerByAccountId(req.user._id)
            response.profile = customer
        } else if (req.user.role === 'employee') {
            const employee = await employeeManager.getEmployeeByAccountId(req.user._id)
            response.profile = employee
        }
    } catch {
        response.profile = null
    }
    res.json(response)
})

router.post('/', async(req, res, next) => {
    try {
        const { role } = req.body
        let result
        if (role === 'customer') {
            result = await customerManager.createCustomer(req.body)
        } else if (role === 'employee') {
            result = await employeeManager.createEmployee(req.body)
        } else {
            return res.status(400).json({ error: 'Invalid role' })
        }
        res.json(result)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
})

router.post('/session', (req, res, next) => {
    passport.authenticate('local', (err, user) => {
        if (err) return res.status(500).json({ error: err.message })
        if (!user) return res.status(401).json({ error: 'Invalid email or password' })
        req.login(user, (loginErr) => {
            if (loginErr) return res.status(500).json({ error: loginErr.message })
            res.json(user)
        })
    })(req, res, next)
})

router.delete('/session', (req, res, next) => {
    req.logout(err => {
        if (err) return res.status(500).json({ error: err.message })
        res.json({ message: 'Logged out' })
    })
})

module.exports = router
