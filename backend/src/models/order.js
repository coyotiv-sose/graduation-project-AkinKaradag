const mongoose = require('mongoose')
const billingInfoSchema = require('./billing-info')
const cargoSchema = require('./cargo')
const { ORDER_STATES } = require('../lib/domain-constants')

const orderSchema = new mongoose.Schema({
  origin: { type: String, required: true },
  destination: { type: String, required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'LogisticCompany', required: true },
  deliveryDate: { type: Date, required: true },
  state: { type: String, enum: ORDER_STATES, default: 'PENDING' },
  cargos: [cargoSchema],
  billingInfo: { type: billingInfoSchema, required: true },
  note: { type: String, default: '' },
})

orderSchema.methods.addCargo = function (cargo) {
  this.cargos.push(cargo)
  return this.save()
}

orderSchema.methods.getCargos = function () {
  return this.cargos
}

module.exports = mongoose.model('Order', orderSchema)
