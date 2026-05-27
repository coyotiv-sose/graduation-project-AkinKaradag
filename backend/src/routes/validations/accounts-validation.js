const { Joi } = require('celebrate')

const { validateBody } = require('../../lib/validation/celebrate-builders')

const loginBodySchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required(),
  password: Joi.string().required(),
}).required()

const validateLogin = validateBody(loginBodySchema)

module.exports = {
  validateLogin,
}
