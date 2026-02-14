const mongoose = require('mongoose')

const cargoSchema = new mongoose.Schema({
    loadCarrierType: { type: String, required: true },
    dimensions: {
        width: { type: Number, required: true },
        length: { type: Number, required: true },
        height: { type: Number, required: true },
    },
    weight: { type: Number, required: true },
    quantity: { type: Number, required: true },
}, { _id: false })

cargoSchema.virtual('volume').get(function() {
    return this.dimensions.width * this.dimensions.length * this.dimensions.height
})

module.exports = cargoSchema