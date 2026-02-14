const axios = require('axios')

async function main() {

    const company1 = await axios.post('http://localhost:3000/companies', {
        companyName: 'company1',
        address: 'Some Street 1',
        postalCode: '43121',
        city: 'Somewhere',
    })

    const company2 = await axios.post('http://localhost:3000/companies', {
        companyName: 'company2',
        address: 'Side Street 2',
        postalCode: '88789',
        city: 'KimBilirNerede',
    })

    const company1Id = company1.data._id
    const company2Id = company2.data._id


    const customer1 = await axios.post(`http://localhost:3000/companies/${company1Id}/customers`, {
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

    await axios.post(`http://localhost:3000/companies/${company2Id}/vehicles`, {
        name: 'Truck1',
        brand: 'Mercedes',
        model: 'Sprinter',
        year: 2005,
        payLoad: 800,
    })

 
    await axios.post(`http://localhost:3000/customers/${customer1Id}/orders`, {
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
        }],
    })

    const tour = await axios.post(`http://localhost:3000/companies/${company1Id}/tours`, {
        date: '2026-09-23',
        startLocation: 'Zurich',
        endLocation: 'Basel'
    })
    console.log('Tour: ', tour.data)


    const allCompanies = await axios.get('http://localhost:3000/companies')
    console.log('All companies:', allCompanies.data)


    const orders = await axios.get(`http://localhost:3000/customers/${customer1Id}/orders`)
    console.log('Customer1 orders:', orders.data)

    const customers = await axios.get(`http://localhost:3000/companies/${company1Id}/customers`)
    console.log('Company1 customers: ', customers.data)

    const customer = await axios.get(`http://localhost:3000/customers/${customer1Id}`)
    console.log('Customer1: ', customer.data)

    const vehicles = await axios.get(`http://localhost:3000/companies/${company2Id}/vehicles`)
    console.log('Company2 vehicles: ', vehicles.data)

    const companyOrders = await axios.get(`http://localhost:3000/companies/${company1Id}/orders`)
    console.log('Company1 orders: ', companyOrders.data)

    const tours = await axios.get(`http://localhost:3000/companies/${company1Id}/tours`)
    console.log('Company1 tours: ', tours.data)
}


main()