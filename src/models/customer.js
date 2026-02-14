const orderManager = require('../managers/order-manager')
const mongoose = require('mongoose')
const billingInfoSchema = require('./billing-info')
const autopopulate = require('mongoose-autopopulate')

const customerSchema = new mongoose.Schema({
    account: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
    customerName: { type: String, required: true },
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'LogisticCompany' },
    billingInfo: [billingInfoSchema],
    profile: { type: String, default: 'CUSTOMER_DEFAULT' },
})

customerSchema.methods.placeOrder = function(orderData) {
    return orderManager.createOrder({
        ...orderData,
        customer: this._id,
        company: this.company,
    })
}

customerSchema.plugin(autopopulate)

module.exports = mongoose.model('Customer', customerSchema)