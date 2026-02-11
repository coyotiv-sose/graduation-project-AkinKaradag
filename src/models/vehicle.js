class Vehicle {
    constructor({ id, name, brand, model, year, payload, companyId }) {
        this.id = id
        this.companyId = companyId
        this.name = name
        this.brand = brand
        this.model = model
        this.year = year
        this.payload = payload
        this.isAvailable = true
        this.cargos = []
    }

    loadCargo(cargo) {
        this.cargos.push(cargo)
    }
}

module.exports = Vehicle