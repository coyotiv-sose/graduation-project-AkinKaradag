/* eslint-disable consistent-return */
const express = require('express')

const rateLimit = require('express-rate-limit')
const { validateLogin } = require('./validations/accounts-validation')

const router = express.Router()
const customerManager = require('../managers/customer-manager')
const employeeManager = require('../managers/employee-manager')
const accountManager = require('../managers/account-manager')

const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.LOGIN_RATE_LIMIT_MAX || 20),
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Please try again later.' },
})

router.get('/session', async (req, res) => {
  if (!req.user) return res.send(null)
  const response = { ...req.user.toObject() }
  try {
    if (req.user.role === 'customer') {
      const customer = await customerManager.getCustomerByAccountId(req.user._id)
      response.profile = customer
    } else if (req.user.role === 'employee') {
      const employee = await employeeManager.getEmployeeByAccountId(req.user._id)
      response.profile = employee
    } else if (req.user.role === 'admin') {
      response.profile = null
    }
  } catch {
    response.profile = null
  }
  res.json(response)
})

router.post('/', (req, res) => {
  res.status(403).json({
    error: 'Public account registration is disabled',
  })
})

router.post('/session', loginRateLimiter, validateLogin, async (req, res, next) => {
  try {
    const account = await accountManager.getAccountByEmail(req.body.email)

    const result = await accountManager.verifyAccountPassword(account, req.body.password)

    if (!result.success) {
      if (account && !account.isLoginLocked()) {
        await accountManager.registerFailedLoginAttempt(account)
      }
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    await accountManager.resetFailedLoginAttempts(result.user)

    return req.session.regenerate(regenerateErr => {
      if (regenerateErr) return next(regenerateErr)
      return req.login(result.user, loginErr => {
        if (loginErr) return next(loginErr)
        return res.json(result.user)
      })
    })
  } catch (error) {
    return next(error)
  }
})

router.delete('/session', (req, res, next) => {
  req.logout(err => {
    if (err) return next(err)
    res.json({ message: 'Logged out' })
  })
})

module.exports = router
