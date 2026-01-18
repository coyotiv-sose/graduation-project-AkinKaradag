class Tour {
    constructor(tourId, vehicle, date, startLocation, endLocation) {
        this.tourId = tourId;
        this.vehicle = vehicle;
        this.date = date;
        this.startLocation = startLocation;
        this.endLocation = endLocation;
        this.orders = [];
        this.status = 'PLANNED';
    }

    addOrder(order) {
        this.orders.push(order);
    }

    startTour() {
        this.status = 'STARTED';
    }

    endTour() {
        this.status = 'FINISHED';
    }
}

module.exports = Tour;