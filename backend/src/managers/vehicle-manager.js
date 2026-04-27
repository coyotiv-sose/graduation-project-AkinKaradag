const Vehicle = require('../models/vehicle')

const VEHICLE_MUTABLE_FIELDS = ['name', 'brand', 'model', 'year', 'payLoad', 'state']

const pickAllowedFields = (payload, allowedFields) =>
  Object.fromEntries(Object.entries(payload || {}).filter(([key]) => allowedFields.includes(key)))

const createVehicle = async vehicleData => {
  const newVehicle = await Vehicle.create(vehicleData)
  return newVehicle
}

const findVehicleById = async vehicleId => {
  const vehicle = await Vehicle.findById(vehicleId)
  if (!vehicle) throw new Error('Vehicle not found')
  return vehicle
}

const updateVehicle = async (vehicleId, updatedData) => {
  const allowedUpdates = pickAllowedFields(updatedData, VEHICLE_MUTABLE_FIELDS)
  if (!Object.keys(allowedUpdates).length) {
    throw new Error('No valid vehicle fields to update')
  }

  const vehicle = await Vehicle.findOneAndUpdate(
    { _id: vehicleId },
    { $set: allowedUpdates },
    { new: true, runValidators: true }
  )

  if (!vehicle) {
    const exist = await Vehicle.findById(vehicleId)
    if (!exist) throw new Error('Vehicle not found')
  }
  return vehicle
}

const getAllVehiclesOfCompany = companyId => Vehicle.find({ company: companyId })

module.exports = { createVehicle, findVehicleById, getAllVehiclesOfCompany, updateVehicle }
