const { Joi } = require('celebrate')

const { PASSWORD_ALLOWED_REGEX, PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } = require('../../lib/password-policy')
const { validateBody } = require('./builders')

const accountRegistrationBodySchema = Joi.object({
  role: Joi.string().valid('customer', 'employee', 'admin').required(),
  email: Joi.string().trim().lowercase().email().required(),
  password: Joi.string().min(PASSWORD_MIN_LENGTH).max(PASSWORD_MAX_LENGTH).pattern(PASSWORD_ALLOWED_REGEX).required(),
  customerName: Joi.string().trim().min(1),
  name: Joi.string().trim().min(1),
}).unknown(true)

const loginBodySchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required(),
  password: Joi.string().required(),
}).required()

const validateAccountRegistration = validateBody(accountRegistrationBodySchema)
const validateLogin = validateBody(loginBodySchema)

module.exports = {
  validateAccountRegistration,
  validateLogin,
}
