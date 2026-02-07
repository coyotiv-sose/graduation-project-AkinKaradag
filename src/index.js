const axios = require('axios')

console.log('KaraLog is an application which helps you to manage your daily planning in logistics.')


// fetch users with axios

async function main() {
    const company1 = await axios.post('http://localhost:3000/companies', {
        companyName: 'company1',
        address: 'Some Street 1',
        postalCode: '43121',
        city: 'Somewhere' 
    })

    const company2 = await axios.post('http://localhost:3000/companies', {
        companyName: 'company2',
        address: 'Side Street 2',
        postalCode: '88789',
        city: 'KimBilirNerede'
    })

    const allCompanies = await axios.get('http://localhost:3000/companies')

    const company1Id = company1.data.id
    const company2Id = company2.data.id

    const customer1 = await axios.post(`http://localhost:3000/companies/${company1Id}/customers`, {
        customerName: 'customer1',
        email: 'customer1@mail.com',
        password: 'shouldNotBeHere',
        billingInfo: {
            customerName: 'customer1',
            address: 'Main Street 1',
            postalCode: '1234',
            city: 'Main City',
            VATnr: 'VAT-001'
        }
    })

    const customer2 = await axios.post(`http://localhost:3000/companies/${company2Id}/customers`, {
        customerName: 'customer2',
        email: 'customer2@mail.com',
        password: 'shouldNotBeHere',
        billingInfo: {
            customerName: 'customer2',
            address: 'Main Street 2',
            postalCode: '2234',
            city: 'Main City',
            VATnr: 'VAT-002'
        }
    })

    const customer1Id = customer1.data.id
    const customer2Id = customer2.data.id

    // await axios.post(`http://localhost:3000/customers/${customer1Id}/orders`, {
    //     origin: 'Geneva',
    //     destination: 'Bern',
    //     deliveryDate: '2026-05-02'
    // })


    await axios.post(`http://localhost:3000/companies/${company2Id}/vehicles`, {
        name: 'Truck1',
        brand: 'Mercedes',
        model: 'Sprinter',
        year: '2005',
        payload: '800 Kg'
    })


    console.log('List of all companies (only visible for Admins): ', allCompanies.data)

    await axios.get('http://localhost:3000/orders')

    await axios.post('http://localhost:3000/orders', {
        orderId: Date.now(),
        origin: 'Zurich',
        destination: 'Basel',
        customerId: Date.now(),
        deliveryDate: '2026-03-16',
        state: 'pending',
        billingInfo: {
            customerName: 'customer1',
            address: 'Patternstreet 1',
            postalCode: 1234,
            city: 'Pattern',
            VATnr: 'VAT-007',
        },
    })
}

main()