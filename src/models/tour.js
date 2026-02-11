class Tour {
    constructor({ tourId, date, startLocation, endLocation }) {
        this.tourId = tourId
        this.vehicle = null
        this.date = date
        this.startLocation = startLocation
        this.endLocation = endLocation
        this.orders = []
        this.status = 'PLANNED'
    }

    addOrder(order) {
        this.orders.push(order)
    }

    assignVehicle(vehicle) {
        this.vehicle = vehicle
    }

    startTour() {
        this.status = 'STARTED'
    }

    endTour() {
        this.status = 'FINISHED'
    }
}

module.exports = Tour