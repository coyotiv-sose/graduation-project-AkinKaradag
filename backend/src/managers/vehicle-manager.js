const Vehicle = require('../models/vehicle')

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
  const vehicle = await Vehicle.findOneAndUpdate(
    { _id: vehicleId },
    { $set: updatedData },
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
