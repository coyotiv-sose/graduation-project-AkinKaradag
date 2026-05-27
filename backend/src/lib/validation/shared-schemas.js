const { Joi } = require('celebrate')

const { nonEmptyStringSchema, objectIdSchema, ORDER_STATES } = require('./primitives')
const { createUpdateBodySchema } = require('./builders')

const billingInfoSchema = Joi.object({
  label: nonEmptyStringSchema,
  customerName: nonEmptyStringSchema.required(),
  address: nonEmptyStringSchema.required(),
  postalCode: nonEmptyStringSchema.required(),
  city: nonEmptyStringSchema.required(),
  VATnr: Joi.string().trim().allow(''),
  isDefault: Joi.boolean(),
}).required()

const cargoSchema = Joi.object({
  loadCarrierType: nonEmptyStringSchema.required(),
  dimensions: Joi.object({
    width: Joi.number().required(),
    length: Joi.number().required(),
    height: Joi.number().required(),
  }).required(),
  weight: Joi.number().required(),
  quantity: Joi.number().required(),
}).required()

const orderBaseBodyFields = {
  origin: nonEmptyStringSchema,
  destination: nonEmptyStringSchema,
  deliveryDate: Joi.date(),
  state: Joi.string().valid(...ORDER_STATES),
  cargos: Joi.array().items(cargoSchema).min(1),
  billingInfo: billingInfoSchema,
  note: Joi.string().allow(''),
}

const orderUpdateBodySchema = createUpdateBodySchema({
  ...orderBaseBodyFields,
  billingInfo: billingInfoSchema.optional(),
  customer: objectIdSchema,
  company: objectIdSchema,
})

module.exports = {
  billingInfoSchema,
  cargoSchema,
  orderBaseBodyFields,
  orderUpdateBodySchema,
}
