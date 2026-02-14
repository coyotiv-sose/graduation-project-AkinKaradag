const Vehicle = require('../models/vehicle')

const createVehicle = async vehicleData => {
    const newVehicle = await Vehicle.create(vehicleData)
    return newVehicle
}

const findVehicleById = async vehicleId => {
    const vehicle = await Vehicle.findById(vehicleId)
    if(!vehicle) throw new Error('Vehicle not found')
    return vehicle
}

const getAllVehiclesOfCompany = companyId => Vehicle.find({ company: companyId})

module.exports = { createVehicle, findVehicleById, getAllVehiclesOfCompany }