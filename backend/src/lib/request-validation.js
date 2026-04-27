const { Joi } = require('celebrate')

const objectIdPattern = /^[0-9a-fA-F]{24}$/
const objectIdSchema = Joi.string().pattern(objectIdPattern)

const ORDER_STATES = ['PENDING', 'IN_PROCESS', 'DELIVERED']
const TOUR_STATES = ['STARTED', 'PLANNED', 'CANCELLED', 'FINISHED']
const VEHICLE_STATES = ['AVAILABLE', 'ON_TOUR', 'IN_GARAGE', 'DAMAGED', 'PARKED', 'SOLD', 'OTHER_REASON']

const nonEmptyStringSchema = Joi.string().trim().min(1)
const emailSchema = Joi.string().trim().lowercase().email()

const objectIdParamsSchema = (...keys) =>
  Joi.object(Object.fromEntries(keys.map(key => [key, objectIdSchema.required()]))).required()

const createBodySchema = (fields, requiredKeys = []) => {
  const requiredKeySet = new Set(requiredKeys)

  return Joi.object(
    Object.fromEntries(
      Object.entries(fields).map(([key, schema]) => [key, requiredKeySet.has(key) ? schema.required() : schema])
    )
  ).required()
}

const createUpdateBodySchema = fields =>
  Joi.object(fields)
    .or(...Object.keys(fields))
    .unknown(true)
    .required()

const createCompanyScopedBodySchema = fields =>
  Joi.object({
    company: objectIdSchema.required(),
    ...fields,
  })
    .unknown(true)
    .required()

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

const companyBodyFields = {
  companyName: nonEmptyStringSchema,
  address: nonEmptyStringSchema,
  postalCode: nonEmptyStringSchema,
  city: nonEmptyStringSchema,
}

const customerBodyFields = {
  customerName: nonEmptyStringSchema,
  email: emailSchema,
  billingInfo: Joi.array().items(billingInfoSchema),
  profile: nonEmptyStringSchema,
}

const employeeBodyFields = {
  name: nonEmptyStringSchema,
  email: emailSchema,
  profile: nonEmptyStringSchema,
}

const companyCreateBodySchema = createBodySchema(
  {
    ...companyBodyFields,
    ownerName: nonEmptyStringSchema,
    ownerEmail: emailSchema,
    ownerPassword: Joi.string().min(1),
  },
  ['companyName', 'address', 'postalCode', 'city']
)

const companyUpdateBodySchema = createUpdateBodySchema(companyBodyFields)

const customerCreateBodySchema = createBodySchema(
  {
    ...customerBodyFields,
    password: Joi.string().min(1),
  },
  ['customerName', 'email', 'password']
)

const customerUpdateBodySchema = createUpdateBodySchema(customerBodyFields)

const customerUpdateByAdminBodySchema = createCompanyScopedBodySchema(customerBodyFields)

const employeeCreateBodySchema = createBodySchema(
  {
    ...employeeBodyFields,
    password: Joi.string().min(1),
  },
  ['name', 'email', 'password']
)

const employeeUpdateBodySchema = createUpdateBodySchema(employeeBodyFields)

const employeeUpdateByAdminBodySchema = createCompanyScopedBodySchema(employeeBodyFields)

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
  billingInfo: billingInfoSchema,
}).required()

const orderUpdateBodySchema = createUpdateBodySchema({
  ...orderBaseBodyFields,
  customer: objectIdSchema,
  company: objectIdSchema,
})

const orderDeleteByAdminBodySchema = Joi.object({
  company: objectIdSchema.required(),
}).required()

const vehicleBodyFields = {
  name: nonEmptyStringSchema,
  brand: nonEmptyStringSchema,
  model: nonEmptyStringSchema,
  year: Joi.number(),
  payLoad: Joi.number(),
  state: Joi.string().valid(...VEHICLE_STATES),
}

const vehicleCreateBodySchema = createBodySchema(vehicleBodyFields, ['brand', 'model', 'year', 'payLoad'])

const vehicleUpdateBodySchema = createUpdateBodySchema(vehicleBodyFields)

const tourBodyFields = {
  date: Joi.date(),
  startLocation: Joi.string().trim().allow(''),
  endLocation: Joi.string().trim().allow(''),
  orders: Joi.array().items(objectIdSchema),
  state: Joi.string().valid(...TOUR_STATES),
  vehicle: objectIdSchema.allow(null),
}

const tourCreateBodySchema = createBodySchema(tourBodyFields, ['date'])

const tourUpdateBodySchema = createUpdateBodySchema(tourBodyFields)

const tourAddOrderBodySchema = Joi.object({
  orderId: objectIdSchema.required(),
}).required()

const tourAssignVehicleBodySchema = Joi.object({
  vehicleId: objectIdSchema.required(),
}).required()

module.exports = {
  objectIdPattern,
  objectIdSchema,
  objectIdParamsSchema,
  billingInfoSchema,
  cargoSchema,
  companyCreateBodySchema,
  companyUpdateBodySchema,
  customerCreateBodySchema,
  customerUpdateBodySchema,
  customerUpdateByAdminBodySchema,
  employeeCreateBodySchema,
  employeeUpdateBodySchema,
  employeeUpdateByAdminBodySchema,
  orderCreateBodySchema,
  orderCreateByCompanyBodySchema,
  orderGenerateBodySchema,
  orderUpdateBodySchema,
  orderDeleteByAdminBodySchema,
  vehicleCreateBodySchema,
  vehicleUpdateBodySchema,
  tourCreateBodySchema,
  tourUpdateBodySchema,
  tourAddOrderBodySchema,
  tourAssignVehicleBodySchema,
}
