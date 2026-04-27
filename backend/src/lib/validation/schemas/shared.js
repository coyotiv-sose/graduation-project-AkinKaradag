const { Joi } = require('celebrate')

const { nonEmptyStringSchema } = require('../primitives')

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

module.exports = {
  billingInfoSchema,
  cargoSchema,
}
