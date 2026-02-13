const mongoose = require('mongoose')

const logisticCompanySchema = new mongoose.Schema({
    companyName: { type: String, required: true },
    address: { type: String, required: true },
    postalCode: { type: String, required: true },
    city: { type: String, required: true },
})

module.exports = mongoose.model('LogisticCompany', logisticCompanySchema)