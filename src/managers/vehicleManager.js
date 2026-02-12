const Vehicle = require('../models/vehicle')

const vehicles = []

function createVehicle(vehicleData) {
    const newVehicle = new Vehicle({
        id: Date.now() + 9,
        ...vehicleData,
    })
    vehicles.push(newVehicle)
    return newVehicle
}

function findVehicleById(vehicleId) {
    return vehicles.find(vehicle => vehicle.id === vehicleId)
}

function getVehicles() {
    return vehicles
}

module.exports = { createVehicle, findVehicleById, getVehicles }