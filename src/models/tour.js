const mongoose = require('mongoose')
const orderSchema = require('./order')

const tourSchema = new mongoose.Schema({
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', default: null },
    date: { type: Date, required: true },
    startLocation: { type: String, required: true },
    endLocation: { type: String, required: true },
    orders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
    state: { type: String, enum: ['STARTED', 'PLANNED', 'CANCELLED', 'FINISHED'] },
})

tourSchema.Schema.addOrder = function(order) {
    this.orders.push(order._id)
    return this.save()
}

tourSchema.Schema.assignVehicle = function(vehicle) {
    this.vehicle = vehicle._id
    return this.save()
}

tourSchema.Schema.startTour = function() {
    this.state = 'STARTED'
    return this.save()
}

tourSchema.Schema.endTour = function() {
    this.state = 'FINISHED'
    return this.save()
}

module.exports = mongoose.model('Tour', tourSchema)