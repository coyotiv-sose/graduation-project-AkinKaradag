const orderManager = require('../managers/order-manager')
const mongoose = require('mongoose')
const billingInfoSchema = require('./billing-info')

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
        customerId: this._id,
        companyId: this.company,
    })
}

module.exports = mongoose.model('Customer', customerSchema)