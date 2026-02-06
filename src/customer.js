const orderManager = require('./orderManager')
const Account = require('./account')
const Profile = require('./customerProfile')
const BillingInfo = require('./billingInfo')

class Customer {
    constructor({ profile, account, customerName, billingInfo }) {
        this.id = profile.id
        this.accountId = account.id
        this.customerName = customerName
        this.billingInfo = billingInfo
    }

    placeOrder(company, orderData) {
        return orderManager.createOrder({ company, ...orderData, customerId: this.id })
    }

    static create(customerObj) {
        console.log(`Creating a new Customer with name ${customerObj.customerName}`)

        const account = new Account({
            id: Date.now(),
            email: customerObj.email,
            password: customerObj.password,
        })

        const profile = new Profile({
            id: Date.now() + 1,
            accountId: account.id,
        })

        const billingInfo = new BillingInfo(customerObj.billingInfo)

        const newCustomer = new Customer({
            profile: profile,
            account: account,
            customerName: customerObj.customerName,
            billingInfo: billingInfo,
        })
        console.log('Customer created: ', newCustomer)
        Customer.list.push(newCustomer)

        return newCustomer
    }

    static list = []
}

module.exports = Customer