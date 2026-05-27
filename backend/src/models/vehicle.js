const mongoose = require('mongoose')
const { VEHICLE_STATES } = require('../lib/domain-constants')

const vehicleSchema = new mongoose.Schema({
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'LogisticCompany', required: true },
  name: { type: String },
  brand: { type: String, required: true },
  model: { type: String, required: true },
  year: { type: Number, required: true },
  payLoad: { type: Number, required: true },
  state: {
    type: String,
    enum: VEHICLE_STATES,
    default: 'AVAILABLE',
  },
})

module.exports = mongoose.model('Vehicle', vehicleSchema)
