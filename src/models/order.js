const mongoose = require('mongoose')
const billingInfoSchema = require('./billing-info')
const cargoSchema = require('./cargo')

const orderSchema = new mongoose.Schema({
    origin: { type: String, required: true },
    destination: { type: String, required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'LogisticCompany', required: true },
    deliveryDate: { type: Date, required: true },
    state: { type: String, enum: ['PENDING', 'IN_PROCESS', 'DELIVERED'], default: 'PENDING' },
    cargos: [cargoSchema],
    billingInfo: { type: billingInfoSchema, required: true },
})

orderSchema.methods.addCargo = function(cargo) {
    this.cargos.push(cargo)
    return this.save()
}

orderSchema.methods.getCargos = function() {
    return this.cargos
}

module.exports = mongoose.model('Order', orderSchema)