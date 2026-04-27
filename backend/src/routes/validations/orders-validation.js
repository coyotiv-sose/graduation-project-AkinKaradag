const { orderUpdateBodySchema } = require('../../lib/request-validation')
const { validateParams, validateParamsAndBody } = require('./builders')

const validateOrderIdParam = validateParams('orderId')
const validateUpdateOrder = validateParamsAndBody('orderId', orderUpdateBodySchema)

module.exports = {
  validateOrderIdParam,
  validateUpdateOrder,
}
