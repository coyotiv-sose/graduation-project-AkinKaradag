const Tour = require('../models/tour')
const Order = require('../models/order')
const Vehicle = require('../models/vehicle')

const TOUR_MUTABLE_FIELDS = ['date', 'startLocation', 'endLocation', 'state', 'vehicle']

const hasOwn = (object, key) => Object.prototype.hasOwnProperty.call(object || {}, key)

const validateStateTransition = (currentState, nextState) => {
  const isTerminal = currentState === 'FINISHED' || currentState === 'CANCELLED'
  if (isTerminal) {
    throw new Error(`Cannot update a tour that is ${currentState.toLowerCase()}`)
  }

  if (currentState === 'STARTED' && nextState && !['FINISHED', 'CANCELLED'].includes(nextState)) {
    throw new Error('A started tour can only be finished or cancelled')
  }
}

const pickAllowedFields = (payload, allowedFields) =>
  Object.fromEntries(Object.entries(payload || {}).filter(([key]) => allowedFields.includes(key)))

const createTour = async tourData => {
  if (tourData.vehicle) {
    const vehicle = await Vehicle.findById(tourData.vehicle)
    if (!vehicle) throw new Error('Vehicle not found')
    if (vehicle.state !== 'AVAILABLE') throw new Error('Vehicle is not available')
    if (tourData.company && vehicle.company.toString() !== tourData.company.toString()) {
      throw new Error('Vehicle does not belong to this company')
    }
  }
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

  const order = await Order.findById(orderId)
  if (!order) throw new Error('Order not found')
  if (order.company.toString() !== tour.company.toString()) {
    throw new Error('Order does not belong to this company')
  }

  return tour.addOrder(orderId)
}

const assignVehicleToTour = async (tourId, vehicleId) => {
  const tour = await Tour.findById(tourId)
  if (!tour) throw new Error('Tour not found')
  const vehicle = await Vehicle.findById(vehicleId)
  if (!vehicle) throw new Error('Vehicle not found')
  if (vehicle.company.toString() !== tour.company.toString()) {
    throw new Error('Vehicle does not belong to this company')
  }
  if (vehicle.state !== 'AVAILABLE') throw new Error('Vehicle is not available')
  return tour.assignVehicle(vehicleId)
}

const updateTour = async (tourId, updateData) => {
  const tour = await Tour.findById(tourId)
  if (!tour) throw new Error('Tour not found')

  const allowedUpdates = pickAllowedFields(updateData, TOUR_MUTABLE_FIELDS)

  if (!Object.keys(allowedUpdates).length) {
    throw new Error('No valid tour fields to update')
  }

  if (hasOwn(allowedUpdates, 'vehicle')) {
    const requestedVehicleId = allowedUpdates.vehicle

    if (requestedVehicleId === null) {
      tour.vehicle = null
    } else {
      const vehicle = await Vehicle.findById(requestedVehicleId)
      if (!vehicle) throw new Error('Vehicle not found')
      if (vehicle.company.toString() !== tour.company.toString()) {
        throw new Error('Vehicle does not belong to this company')
      }
      if (vehicle.state !== 'AVAILABLE') throw new Error('Vehicle is not available')
      tour.vehicle = vehicle._id
    }
  }

  delete allowedUpdates.vehicle

  const orderIds = tour.orders.map(o => o._id || o)
  const nextState = allowedUpdates.state
  validateStateTransition(tour.state, nextState)

  delete allowedUpdates.state
  Object.assign(tour, allowedUpdates)

  if (nextState === 'STARTED') {
    await Order.updateMany({ _id: { $in: orderIds }, state: 'PENDING' }, { $set: { state: 'IN_PROCESS' } })
    return tour.startTour()
  }

  if (nextState === 'FINISHED') {
    await Order.updateMany({ _id: { $in: orderIds }, state: 'IN_PROCESS' }, { $set: { state: 'DELIVERED' } })
    return tour.endTour()
  }

  if (nextState === 'CANCELLED') {
    await Order.updateMany({ _id: { $in: orderIds }, state: 'IN_PROCESS' }, { $set: { state: 'PENDING' } })
    tour.state = 'CANCELLED'
    return tour.save()
  }

  if (nextState) {
    tour.state = nextState
  }

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
