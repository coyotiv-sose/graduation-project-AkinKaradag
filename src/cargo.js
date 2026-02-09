const { createDimension, volume } = require('./dimension')
class Cargo {
    constructor(loadCarrierType, dimensions, weight, quantity) {
        this.loadCarrierType = loadCarrierType
        this.dimensions = dimensions
        this.weight = weight
        this.quantity = quantity
    }

    static create(cargoData) {
        return new Cargo({
            loadCarrierType: cargoData.loadCarrierType,
            weight: cargoData.weight,
            quantity: cargoData.quantity,
            dimensions: createDimension(cargoData.dimensions),
        })
    }
}

module.exports = Cargo