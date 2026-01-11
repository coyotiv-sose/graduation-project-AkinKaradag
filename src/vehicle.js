class Vehicle {
  isAvailable = true

  constructor(name, brand, model, year, payload) {
    this.name = name
    this.brand = brand
    this.model = model
    this.year = year
    this.payload = payload
    this.cargos = []
  }

  loadCargo(cargo) {
    this.cargos.push(cargo)
  }
}

module.exports = Vehicle