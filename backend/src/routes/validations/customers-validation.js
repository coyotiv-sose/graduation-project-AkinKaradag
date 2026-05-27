const { Joi } = require('celebrate')

const { nonEmptyStringSchema } = require('../../lib/validation/primitives')
const { createBodySchema } = require('../../lib/validation/builders')
const { billingInfoSchema, cargoSchema, orderBaseBodyFields } = require('../../lib/validation/shared-schemas')
const { validateParams, validateParamsAndBody } = require('../../lib/validation/celebrate-builders')

const orderCreateBodySchema = createBodySchema(orderBaseBodyFields, [
  'origin',
  'destination',
  'deliveryDate',
  'cargos',
  'billingInfo',
])

const orderGenerateBodySchema = Joi.object({
  prompt: nonEmptyStringSchema.max(2000).required(),
  billingInfo: billingInfoSchema.optional(),
}).required()

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
