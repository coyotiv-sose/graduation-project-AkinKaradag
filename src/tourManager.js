const Tour = require('./tour');

const tours = [];

function createTour({tourId, vehicle, date, startLocation, endLocation}) {
    const newTour = new Tour(tourId, vehicle, date, startLocation, endLocation);
    tours.push(newTour);
    return newTour;
}

function getTours() {
    return tours;
}

module.exports = {createTour, getTours}