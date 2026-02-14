const mongoose = require('mongoose')
const orderSchema = require('./order')
const autopopulate = require('mongoose-autopopulate')

const tourSchema = new mongoose.Schema({
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'LogisticCompany', required: true},
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', default: null },
    date: { type: Date, required: true },
    startLocation: { type: String, required: true },
    endLocation: { type: String, required: true },
    orders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
    state: { type: String, enum: ['STARTED', 'PLANNED', 'CANCELLED', 'FINISHED'] },
})

tourSchema.methods.addOrder = function(order) {
    this.orders.push(order._id)
    return this.save()
}

tourSchema.methods.assignVehicle = function(vehicle) {
    this.vehicle = vehicle._id
    return this.save()
}

tourSchema.methods.startTour = function() {
    this.state = 'STARTED'
    return this.save()
}

tourSchema.methods.endTour = function() {
    this.state = 'FINISHED'
    return this.save()
}

tourSchema.plugin(autopopulate)

module.exports = mongoose.model('Tour', tourSchema)