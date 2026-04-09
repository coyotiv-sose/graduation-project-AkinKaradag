const { findOrderById } = require('./order-manager')
const Tour = require('../models/tour')
const Order = require('../models/order')
const Vehicle = require('../models/vehicle')

const createTour = async tourData => {
  return Tour.create(tourData)
}

const findTourById = async tourId => {
  const tour = await Tour.findById(tourId)
  if (!tour) throw new Error('Tour not found')
  return tour
}

const getAllToursByCompany = async companyId => Tour.find({ company: companyId })

const getCargosByTour = async tourId => {
  const tour = await Tour.findById(tourId)
  if (!tour) throw new Error('Tour not found')
  return tour.orders.flatMap(order => order.cargos)
}

const addOrderToTour = async (tourId, orderId) => {
  const tour = await Tour.findById(tourId)
  if (!tour) throw new Error('Tour not found')
  return tour.addOrder(orderId)
}

const assignVehicleToTour = async (tourId, vehicleId) => {
  const tour = await Tour.findById(tourId)
  if (!tour) throw new Error('Tour not found')
  const vehicle = await Vehicle.findById(vehicleId)
  if (!vehicle) throw new Error('Vehicle not found')
  if (vehicle.state !== 'AVAILABLE') throw new Error('Vehicle is not available')
  return tour.assignVehicle(vehicleId)
}

const updateTour = async (tourId, updateData) => {
  const tour = await Tour.findById(tourId)
  if (!tour) throw new Error('Tour not found')

  const orderIds = tour.orders.map(o => o._id || o)

  if (updateData.state === 'STARTED') {
    await Order.updateMany(
      { _id: { $in: orderIds }, state: 'PENDING' },
      { $set: { state: 'IN_PROCESS' } }
    )
    return tour.startTour()
  }

  if (updateData.state === 'FINISHED') {
    await Order.updateMany(
      { _id: { $in: orderIds }, state: 'IN_PROCESS' },
      { $set: { state: 'DELIVERED' } }
    )
    return tour.endTour()
  }

  Object.assign(tour, updateData)
  return tour.save()
}

module.exports = {
  createTour,
  findTourById,
  getAllToursByCompany,
  getCargosByTour,
  addOrderToTour,
  assignVehicleToTour,
  updateTour,
}
