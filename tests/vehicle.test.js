/* eslint-disable prettier/prettier */
/* eslint-disable no-undef */
const { createCompany, clearDatabase, app, request, mongoose} = require('./helper')

describe('Vehicle', () => {
    let company

    beforeEach(async() => {
        await clearDatabase()
        company = await createCompany()
    })

    it('should create a vehicle', async() => {
        const vehicleData = {
            name: 'Truck1',
            brand: 'Mercedes',
            model: 'Sprinter',
            year: 2005,
            payLoad: 800,
        }

        const response = await request(app).post(`/companies/${company.body._id}/vehicles`).send(vehicleData)

        expect(response.status).toBe(201)
        expect(response.body).toMatchObject(vehicleData)
    })

    it('should find a vehicle by Id', async() => {
        const vehicle = await request(app).post(`/companies/${company.body._id}/vehicles`).send({
            name: 'Truck2',
            brand: 'Mercedes',
            model: 'Sprinter',
            year: 2009,
            payLoad: 1000,
        })

        const response = await request(app).get(`/vehicles/${vehicle.body._id}`)
        expect(response.status).toBe(200)
        expect(response.body.name).toBe('Truck2')
    })

    it('should not find vehicle by id', async() => {
        const fakeId = new mongoose.Types.ObjectId()

        const response = await request(app).get(`/vehicles/${fakeId}`)
        expect(response.status).toBe(500)
        expect(response.body.error).toBe('Vehicle not found')
    })

    it('should change the state of vehicle', async() => {

        const vehicleResponse = await request(app).post(`/companies/${company.body._id}/vehicles`).send({
            name: 'Truck3',
            brand: 'Mercedes',
            model: 'Sprinter',
            year: 2005,
            payLoad: 800,
        })

        const response = await request(app).put(`/companies/${company.body._id}/vehicles/${vehicleResponse.body._id}`).send({
            state: 'IN_GARAGE'
        })
        expect(response.status).toBe(200)
        expect(response.body.state).toBe('IN_GARAGE')
    })

    it('should not find vehicle when trying to update vehicle and it does not exist', async() => {
        const fakeId = new mongoose.Types.ObjectId()
        const response = await request(app).put(`/companies/${company.body._id}/vehicles/${fakeId}`).send({
            state: 'IN_GARAGE'
        })
        expect(response.status).toBe(404)
        expect(response.body.error).toBe('Vehicle not found')
    })

})