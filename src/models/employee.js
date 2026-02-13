const mongoose = require('mongoose')

const employeeSchema = new mongoose.Schema({
    account: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
    name: { type: String, required: true },
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'LogisticCompany' },
    profile: { type: String, default: 'DISPATCHER' },
})

module.exports = mongoose.model('Employee', employeeSchema)