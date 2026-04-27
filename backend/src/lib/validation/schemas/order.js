const { Joi } = require('celebrate')

const { nonEmptyStringSchema, objectIdSchema, ORDER_STATES } = require('../primitives')
const { createBodySchema, createUpdateBodySchema } = require('../builders')
const { billingInfoSchema, cargoSchema } = require('./shared')

const orderBaseBodyFields = {
  origin: nonEmptyStringSchema,
  destination: nonEmptyStringSchema,
  deliveryDate: Joi.date(),
  state: Joi.string().valid(...ORDER_STATES),
  cargos: Joi.array().items(cargoSchema).min(1),
  billingInfo: billingInfoSchema,
  note: Joi.string().allow(''),
}

const orderCreateBodySchema = createBodySchema(orderBaseBodyFields, [
  'origin',
  'destination',
  'deliveryDate',
  'cargos',
  'billingInfo',
])

const orderCreateByCompanyBodySchema = createBodySchema(
  {
    ...orderBaseBodyFields,
    customer: objectIdSchema,
  },
  ['origin', 'destination', 'deliveryDate', 'customer', 'cargos', 'billingInfo']
)

const orderGenerateBodySchema = Joi.object({
  prompt: nonEmptyStringSchema.required(),
  billingInfo: billingInfoSchema.optional(),
}).required()

const orderUpdateBodySchema = createUpdateBodySchema({
  ...orderBaseBodyFields,
  customer: objectIdSchema,
  company: objectIdSchema,
})

const orderDeleteByAdminBodySchema = Joi.object({
  company: objectIdSchema.required(),
}).required()

module.exports = {
  orderBaseBodyFields,
  orderCreateBodySchema,
  orderCreateByCompanyBodySchema,
  orderGenerateBodySchema,
  orderUpdateBodySchema,
  orderDeleteByAdminBodySchema,
}
