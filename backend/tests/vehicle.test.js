/* eslint-disable prettier/prettier */
/* eslint-disable no-undef */
const { createCompany, clearDatabase, loginAsAdmin, mongoose } = require('./helper')

describe('Vehicle', () => {
    let adminAgent
    let company

    beforeEach(async () => {
        await clearDatabase()
        adminAgent = await loginAsAdmin()
        company = await createCompany(adminAgent)
    })

    it('should create a vehicle', async () => {
        const vehicleData = {
            name: 'Truck1',
            brand: 'Mercedes',
            model: 'Sprinter',
            year: 2005,
            payLoad: 800,
        }

        const response = await adminAgent.post(`/companies/${company.body._id}/vehicles`).send(vehicleData)

        expect(response.status).toBe(201)
        expect(response.body).toMatchObject(vehicleData)
    })

    it('should find a vehicle by Id', async () => {
        const vehicle = await adminAgent.post(`/companies/${company.body._id}/vehicles`).send({
            name: 'Truck2',
            brand: 'Mercedes',
            model: 'Sprinter',
            year: 2009,
            payLoad: 1000,
        })

        const response = await adminAgent.get(`/vehicles/${vehicle.body._id}`)
        expect(response.status).toBe(200)
        expect(response.body.name).toBe('Truck2')
    })

    it('should not find vehicle by id', async () => {
        const fakeId = new mongoose.Types.ObjectId()

        const response = await adminAgent.get(`/vehicles/${fakeId}`)
        expect(response.status).toBe(404)
        expect(response.body.error).toBe('Vehicle not found')
    })

    it('should change the state of vehicle', async () => {
        const vehicleResponse = await adminAgent.post(`/companies/${company.body._id}/vehicles`).send({
            name: 'Truck3',
            brand: 'Mercedes',
            model: 'Sprinter',
            year: 2005,
            payLoad: 800,
        })

        const response = await adminAgent
            .put(`/companies/${company.body._id}/vehicles/${vehicleResponse.body._id}`)
            .send({
                state: 'IN_GARAGE',
            })
        expect(response.status).toBe(200)
        expect(response.body.state).toBe('IN_GARAGE')
    })

    it('should not find vehicle when trying to update vehicle and it does not exist', async () => {
        const fakeId = new mongoose.Types.ObjectId()
        const response = await adminAgent.put(`/companies/${company.body._id}/vehicles/${fakeId}`).send({
            state: 'IN_GARAGE',
        })
        expect(response.status).toBe(404)
        expect(response.body.error).toBe('Vehicle not found')
    })

    it('should not create a vehicle, when a required field is empty', async () => {
        const response = await adminAgent.post(`/companies/${company.body._id}/vehicles`).send({
            brand: 'Mercedes',
            model: 'Sprinter',
            year: 2005,
        })
        expect(response.status).toBe(400)
    })

    it('should find all vehicles of a comapny', async () => {
        await adminAgent.post(`/companies/${company.body._id}/vehicles`).send({
            name: 'Truck22',
            brand: 'Mercedes',
            model: 'Sprinter',
            year: 2009,
            payLoad: 1000,
        })
        await adminAgent.post(`/companies/${company.body._id}/vehicles`).send({
            name: 'Truck23',
            brand: 'MAN',
            model: 'Cargo',
            year: 2009,
            payLoad: 800,
        })
        const response = await adminAgent.get(`/companies/${company.body._id}/vehicles`)
        expect(response.status).toBe(200)
        expect(response.body).toHaveLength(2)
    })


    it('should not find vehicles if there is a invalid company Id', async () => {
        const response = await adminAgent.get('/companies/invalid-id/vehicles')
        expect(response.status).toBe(400)
    })

})
