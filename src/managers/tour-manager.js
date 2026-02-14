const { findOrderById } = require('./order-manager')
const Tour = require('../models/tour')


const createTour = async tourData => {
    return Tour.create(tourData)
}

const findTourById = async tourId => {
    const tour = await Tour.findById(tourId)
    if(!tour) throw new Error('Tour not found')
    return tour
}

const getAllToursByCompany = async companyId => Tour.find({ company: companyId })

const getCargosByTour = async tourId => {
    const tour = await Tour.findById(tourId)
    if(!tour) throw new Error('Tour not found')
    return tour.orders.flatMap(order => order.cargos)
}

module.exports = { createTour, findTourById, getAllToursByCompany, getCargosByTour }