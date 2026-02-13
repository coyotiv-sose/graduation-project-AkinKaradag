const mongoose = require('mongoose')

const vehicleSchema = new mongoose.Schema({
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'LogisticCompany', required: true },
    name: { type: String },
    brand: { type: String, required: true },
    model: { type: String, required: true },
    year: { type: Number, required: true },
    payLoad: { type: Number, required: true },
    isAvailable: { type: Boolean, default: true },
})

module.exports = mongoose.model('Vehicle', vehicleSchema)