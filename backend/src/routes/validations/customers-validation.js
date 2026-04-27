const { cargoSchema, orderCreateBodySchema, orderGenerateBodySchema } = require('../../lib/request-validation')
const { validateParams, validateParamsAndBody } = require('./builders')

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
