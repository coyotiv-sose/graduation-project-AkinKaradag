/* eslint-disable no-undef */
const mongoose = require('mongoose')
const cargoSchema = require('../src/models/cargo')

describe('Cargo Schema', () => {
  it('should require all fields', async () => {
    const Cargo = mongoose.model('Cargo', cargoSchema)
    const cargo = new Cargo()
    const error = cargo.validateSync()
    expect(error.errors.loadCarrierType).toBeDefined()
    expect(error.errors['dimensions.width']).toBeDefined()
    expect(error.errors['dimensions.length']).toBeDefined()
    expect(error.errors['dimensions.height']).toBeDefined()
    expect(error.errors.weight).toBeDefined()
    expect(error.errors.quantity).toBeDefined()
  })

  it('should calculate volume correctly', () => {
    const Cargo = mongoose.model('CargoVolume', cargoSchema)
    const cargo = new Cargo({
      loadCarrierType: 'Pallet',
      dimensions: { width: 2, length: 3, height: 4 },
      weight: 100,
      quantity: 1,
    })
    expect(cargo.volume).toBe(24)
  })
})
