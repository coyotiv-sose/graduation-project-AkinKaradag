const mongoose = require('mongoose')

const billingInfoSchema = mongoose.Schema({
    label: { type: String, default: 'default' },
    customerName: { type: String, required: true },
    address: { type: String, required: true },
    postalCode: { type: String, required: true },
    city: { type: String, required: true },
    VATnr: { type: String },
    isDefault: { type: Boolean, default: false },
})

module.exports = billingInfoSchema