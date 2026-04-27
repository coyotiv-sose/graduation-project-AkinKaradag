/* eslint-disable global-require */
/* eslint-disable consistent-return */
const express = require('express')

const passport = require('passport')
const rateLimit = require('express-rate-limit')
const { celebrate, Joi, Segments } = require('celebrate')

const router = express.Router()
const customerManager = require('../managers/customer-manager')
const employeeManager = require('../managers/employee-manager')
const accountManager = require('../managers/account-manager')
const { PASSWORD_ALLOWED_REGEX, PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } = require('../lib/password-policy')

const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.LOGIN_RATE_LIMIT_MAX || 20),
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Please try again later.' },
})

const validateAccountRegistration = celebrate({
  [Segments.BODY]: Joi.object({
    role: Joi.string().valid('customer', 'employee', 'admin').required(),
    email: Joi.string().trim().lowercase().email().required(),
    password: Joi.string().min(PASSWORD_MIN_LENGTH).max(PASSWORD_MAX_LENGTH).pattern(PASSWORD_ALLOWED_REGEX).required(),
    customerName: Joi.string().trim().min(1),
    name: Joi.string().trim().min(1),
  }).unknown(true),
})

const validateLogin = celebrate({
  [Segments.BODY]: Joi.object({
    email: Joi.string().trim().lowercase().email().required(),
    password: Joi.string().required(),
  }).required(),
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

router.post('/', validateAccountRegistration, async (req, res) => {
  try {
    const { role } = req.body
    let result
    if (role === 'customer') {
      result = await customerManager.createCustomer(req.body)
    } else if (role === 'employee') {
      result = await employeeManager.createEmployee(req.body)
    } else if (role === 'admin') {
      result = await accountManager.createAdminAccount({
        email: req.body.email,
        password: req.body.password,
      })
    } else {
      return res.status(400).json({ error: 'Invalid role' })
    }
    res.json(result)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

router.post('/session', loginRateLimiter, validateLogin, async (req, res, next) => {
  try {
    const normalizedEmail = req.body.email.toLowerCase()
    const account = await accountManager.getAccountByEmail(normalizedEmail)

    if (accountManager.isAccountLoginLocked(account)) {
      return res.status(429).json({ error: 'Account temporarily locked. Please try again later.' })
    }

    passport.authenticate('local', async (err, user) => {
      try {
        if (err) return res.status(500).json({ error: err.message })

        if (!user) {
          const isLocked = await accountManager.registerFailedLoginAttempt(account)
          if (isLocked) {
            return res.status(429).json({ error: 'Account temporarily locked. Please try again later.' })
          }
          return res.status(401).json({ error: 'Invalid email or password' })
        }

        await accountManager.resetFailedLoginAttempts(user)

        req.session.regenerate(regenerateErr => {
          if (regenerateErr) return res.status(500).json({ error: regenerateErr.message })

          req.login(user, loginErr => {
            if (loginErr) return res.status(500).json({ error: loginErr.message })
            res.json(user)
          })
        })
      } catch (error) {
        next(error)
      }
    })(req, res, next)
  } catch (error) {
    next(error)
  }
})

router.delete('/session', (req, res) => {
  req.logout(err => {
    if (err) return res.status(500).json({ error: err.message })
    res.json({ message: 'Logged out' })
  })
})

module.exports = router
