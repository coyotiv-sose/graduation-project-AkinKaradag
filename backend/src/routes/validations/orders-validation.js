const { orderUpdateBodySchema } = require('../../lib/validation/shared-schemas')
const { validateParams, validateParamsAndBody } = require('../../lib/validation/celebrate-builders')

const validateOrderIdParam = validateParams('orderId')
const validateUpdateOrder = validateParamsAndBody('orderId', orderUpdateBodySchema)

module.exports = {
  validateOrderIdParam,
  validateUpdateOrder,
}
