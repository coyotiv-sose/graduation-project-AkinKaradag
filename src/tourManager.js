const Tour = require('./tour');

const tours = [];

function createTour({tourId, vehicle, date, startLocation, endLocation}) {
    const tour = new Tour(tourId, vehicle, date, startLocation, endLocation);
    tours.push(tour);
    return tour;
}

function addOrderToTour(tour, order){
    tour.addOrder(order)
}

function loadOrderToVehicle(vehicle, order) {
    order.getCargos().forEach(cargo => vehicle.loadCargo(cargo))
}

function getTours() {
    return tours;
}

module.exports = {createTour, getTours}