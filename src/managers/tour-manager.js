const { findOrderById } = require('./order-manager')
const Tour = require('./tour')

const tours = []

function createTour({ tourId, vehicle, date, startLocation, endLocation }) {
    const tour = new Tour(tourId, vehicle, date, startLocation, endLocation)
    tours.push(tour)
    return tour
}

function loadOrderToVehicle(vehicle, order) {
    order.getCargos().forEach(cargo => vehicle.loadCargo(cargo))
}

function getTours() {
    return tours
}

function findTourById(tourId) {
    return tours.find(tour => (tour.tourId = tourId))
}

function addOrderToTour(tourId, orderId) {
    const tour = findTourById(tourId)
    if (!tour) throw new Error('Tour not found')

    const order = findOrderById(orderId)
    if (!order) throw new Error('Order not found')

    tour.addOrder(order)
    return tour
}

module.exports = { createTour, getTours, findTourById, addOrderToTour }