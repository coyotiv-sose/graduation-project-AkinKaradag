const api = require('./api')

async function main() {
    const company1 = await api.post('/companies', {
        companyName: 'company1',
        address: 'Some Street 1',
        postalCode: '43121',
        city: 'Somewhere',
    })

    const company2 = await api.post('/companies', {
        companyName: 'company2',
        address: 'Side Street 2',
        postalCode: '88789',
        city: 'KimBilirNerede',
    })

    const company1Id = company1.data._id
    const company2Id = company2.data._id

    const customer1 = await api.post(`/companies/${company1Id}/customers`, {
        customerName: 'customer1',
        email: 'customer1@mail.com',
        password: 'shouldNotBeHere',
        billingInfo: {
            customerName: 'customer1',
            address: 'Main Street 1',
            postalCode: '1234',
            city: 'Main City',
            VATnr: 'VAT-001',
        },
    })

    const customer1Id = customer1.data._id

    const truck1 = await api.post(`/companies/${company2Id}/vehicles`, {
        name: 'Truck1',
        brand: 'Mercedes',
        model: 'Sprinter',
        year: 2005,
        payLoad: 800,
    })

    console.log('Truck1 ID: ', truck1.data._id)

    const order1 = await api.post(`/customers/${customer1Id}/orders`, {
        origin: 'Zurich',
        destination: 'Basel',
        deliveryDate: '2026-03-16',
        billingInfo: {
            customerName: 'customer1',
            address: 'Patternstreet 1',
            postalCode: '1234',
            city: 'Pattern',
            VATnr: 'VAT-007',
        },
        cargos: [{
            loadCarrierType: 'Palette',
            dimensions: { width: 1.2, length: 0.8, height: 1.5 },
            weight: 500,
            quantity: 2,
        }, ],
    })

    const order2 = await api.post(`/customers/${customer1Id}/orders`, {
        origin: 'Bern',
        destination: 'Basel',
        deliveryDate: '2026-03-20',
        billingInfo: {
            customerName: 'customer1',
            address: 'Patternstreet 100',
            postalCode: '1234',
            city: 'Nowhere',
            VATnr: 'VAT-010',
        },
        cargos: [{
            loadCarrierType: 'Industrial Palette',
            dimensions: { width: 1.2, length: 0.8, height: 1.5 },
            weight: 500,
            quantity: 2,
        }, ],
    })

    const order1Id = order1.data._id
    const order2Id = order2.data._id

    const updatedOrder = await api.put(`/orders/${order1Id}`, {
        origin: 'Lugano',
    })

    const deleteOrder = await api.delete(`/customers/${customer1Id}/orders/${order2Id}`)
    console.log('Delete Status: ', deleteOrder.status)

    const tour = await api.post(`/companies/${company1Id}/tours`, {
        date: '2026-09-23',
        startLocation: 'Zurich',
        endLocation: 'Basel',
    })

    const assignedVehicle = await api.put(`/tours/${tour.data._id}/assign-vehicles`, {
        vehicleId: truck1.data._id,
    })

    console.log('Tour: ', tour.data)
    console.log(`Vehicle ${truck1.data.name} is assigned to tour ${tour.data._id}`)

    const allCompanies = await api.get('/companies')
    console.log('All companies:', allCompanies.data)

    const orders = await api.get(`/customers/${customer1Id}/orders`)
    console.log('Customer1 orders:', orders.data)

    const customers = await api.get(`/companies/${company1Id}/customers`)
    console.log('Company1 customers: ', customers.data)

    const customer = await api.get(`/customers/${customer1Id}`)
    console.log('Customer1: ', customer.data)

    const vehicles = await api.get(`/companies/${company2Id}/vehicles`)
    console.log('Company2 vehicles: ', vehicles.data)

    const companyOrders = await api.get(`/companies/${company1Id}/orders`)
    console.log('Company1 orders: ', companyOrders.data)

    const tours = await api.get(`/companies/${company1Id}/tours`)
    console.log('Company1 tours: ', tours.data)

    const changedOriginOrder = await api.get(`/orders/${order1Id}`)
    console.log('Origin of Order1 has been changed: ', changedOriginOrder.data)
}

main()