const Tour = require('../models/tour')
const Order = require('../models/order')
const Vehicle = require('../models/vehicle')
const { DomainError } = require('../lib/domain-error')
const { pickAllowedFields } = require('../lib/object-utils')

const TOUR_MUTABLE_FIELDS = ['date', 'startLocation', 'endLocation', 'state', 'vehicle']

const tourNotFound = () => new DomainError('Tour not found', { status: 404 })
const vehicleNotFound = () => new DomainError('Vehicle not found', { status: 404 })
const orderNotFound = () => new DomainError('Order not found', { status: 404 })
const vehicleNotAvailable = () => new DomainError('Vehicle is not available', { status: 409 })

const hasOwn = (object, key) => Object.prototype.hasOwnProperty.call(object || {}, key)

const validateStateTransition = (currentState, nextState) => {
  const isTerminal = currentState === 'FINISHED' || currentState === 'CANCELLED'
  if (isTerminal) {
    throw new DomainError(`Cannot update a tour that is ${currentState.toLowerCase()}`, { status: 409 })
  }

  if (currentState === 'STARTED' && nextState && !['FINISHED', 'CANCELLED'].includes(nextState)) {
    throw new DomainError('A started tour can only be finished or cancelled', { status: 409 })
  }
}

const createTour = async tourData => {
  if (tourData.vehicle) {
    const vehicle = await Vehicle.findById(tourData.vehicle)
    if (!vehicle) throw vehicleNotFound()
    if (vehicle.state !== 'AVAILABLE') throw vehicleNotAvailable()
    if (tourData.company && vehicle.company.toString() !== tourData.company.toString()) {
      throw new DomainError('Vehicle does not belong to this company', { status: 403 })
    }
  }
  return Tour.create(tourData)
}

const findTourById = async tourId => {
  const tour = await Tour.findById(tourId)
  if (!tour) throw tourNotFound()
  return tour
}

const getAllToursByCompany = async companyId => Tour.find({ company: companyId })

const getCargosByTour = async tourId => {
  const tour = await Tour.findById(tourId)
  if (!tour) throw tourNotFound()
  return tour.orders.flatMap(order => order.cargos)
}

const addOrderToTour = async (tourId, orderId) => {
  const tour = await Tour.findById(tourId)
  if (!tour) throw tourNotFound()

  const order = await Order.findById(orderId)
  if (!order) throw orderNotFound()
  if (order.company.toString() !== tour.company.toString()) {
    throw new DomainError('Order does not belong to this company', { status: 403 })
  }

  return tour.addOrder(orderId)
}

const assignVehicleToTour = async (tourId, vehicleId) => {
  const tour = await Tour.findById(tourId)
  if (!tour) throw tourNotFound()
  const vehicle = await Vehicle.findById(vehicleId)
  if (!vehicle) throw vehicleNotFound()
  if (vehicle.company.toString() !== tour.company.toString()) {
    throw new DomainError('Vehicle does not belong to this company', { status: 403 })
  }
  if (vehicle.state !== 'AVAILABLE') throw vehicleNotAvailable()
  return tour.assignVehicle(vehicleId)
}

const updateTour = async (tourId, updateData) => {
  const tour = await Tour.findById(tourId)
  if (!tour) throw tourNotFound()

  const allowedUpdates = pickAllowedFields(updateData, TOUR_MUTABLE_FIELDS)

  if (!Object.keys(allowedUpdates).length) {
    throw new DomainError('No valid tour fields to update', { status: 400 })
  }

  if (hasOwn(allowedUpdates, 'vehicle')) {
    const requestedVehicleId = allowedUpdates.vehicle

    if (requestedVehicleId === null) {
      tour.vehicle = null
    } else {
      const vehicle = await Vehicle.findById(requestedVehicleId)
      if (!vehicle) throw vehicleNotFound()
      if (vehicle.company.toString() !== tour.company.toString()) {
        throw new DomainError('Vehicle does not belong to this company', { status: 403 })
      }
      if (vehicle.state !== 'AVAILABLE') throw vehicleNotAvailable()
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
