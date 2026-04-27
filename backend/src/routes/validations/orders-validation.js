const { orderUpdateBodySchema } = require('../../lib/validation/schemas/order')
const { validateParams, validateParamsAndBody } = require('../../lib/validation/celebrate-builders')

const validateOrderIdParam = validateParams('orderId')
const validateUpdateOrder = validateParamsAndBody('orderId', orderUpdateBodySchema)

module.exports = {
  validateOrderIdParam,
  validateUpdateOrder,
}
