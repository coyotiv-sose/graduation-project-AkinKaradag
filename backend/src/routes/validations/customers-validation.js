const { cargoSchema } = require('../../lib/validation/schemas/shared')
const { orderCreateBodySchema, orderGenerateBodySchema } = require('../../lib/validation/schemas/order')
const { validateParams, validateParamsAndBody } = require('../../lib/validation/celebrate-builders')

const validateCustomerIdParam = validateParams('customerId')
const validateCustomerOrderParams = validateParams('customerId', 'orderId')
const validateCreateCustomerOrder = validateParamsAndBody('customerId', orderCreateBodySchema)
const validateGenerateCustomerOrder = validateParamsAndBody('customerId', orderGenerateBodySchema)
const validateAddCargoToOrder = validateParamsAndBody(['customerId', 'orderId'], cargoSchema)

module.exports = {
  validateCustomerIdParam,
  validateCustomerOrderParams,
  validateCreateCustomerOrder,
  validateGenerateCustomerOrder,
  validateAddCargoToOrder,
}
