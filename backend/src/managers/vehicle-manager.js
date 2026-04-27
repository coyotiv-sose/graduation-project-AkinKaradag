const Vehicle = require('../models/vehicle')
const { DomainError } = require('../lib/domain-error')
const { pickAllowedFields } = require('../lib/object-utils')

const VEHICLE_MUTABLE_FIELDS = ['name', 'brand', 'model', 'year', 'payLoad', 'state']

const vehicleNotFound = () => new DomainError('Vehicle not found', { status: 404 })

const createVehicle = async vehicleData => {
  const newVehicle = await Vehicle.create(vehicleData)
  return newVehicle
}

const findVehicleById = async vehicleId => {
  const vehicle = await Vehicle.findById(vehicleId)
  if (!vehicle) throw vehicleNotFound()
  return vehicle
}

const updateVehicle = async (vehicleId, updatedData) => {
  const allowedUpdates = pickAllowedFields(updatedData, VEHICLE_MUTABLE_FIELDS)
  if (!Object.keys(allowedUpdates).length) {
    throw new DomainError('No valid vehicle fields to update', { status: 400 })
  }

  const vehicle = await Vehicle.findOneAndUpdate(
    { _id: vehicleId },
    { $set: allowedUpdates },
    { new: true, runValidators: true }
  )

  if (!vehicle) {
    const exist = await Vehicle.findById(vehicleId)
    if (!exist) throw vehicleNotFound()
  }
  return vehicle
}

const getAllVehiclesOfCompany = companyId => Vehicle.find({ company: companyId })

module.exports = { createVehicle, findVehicleById, getAllVehiclesOfCompany, updateVehicle }
