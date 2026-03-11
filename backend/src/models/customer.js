const mongoose = require('mongoose')
const autopopulate = require('mongoose-autopopulate')
const billingInfoSchema = require('./billing-info')

const customerSchema = new mongoose.Schema({
  account: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true, autopopulate: true },
  customerName: { type: String, required: true },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'LogisticCompany' },
  billingInfo: [billingInfoSchema],
  profile: { type: String, default: 'CUSTOMER_DEFAULT' },
})

customerSchema.plugin(autopopulate)

module.exports = mongoose.model('Customer', customerSchema)
