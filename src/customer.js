const orderManager = require('./orderManager')
const Account = require('./account')
const Profile = require('./customerProfile')
const BillingInfo = require('./billingInfo')

class Customer {
    constructor({ profile, account, customerName, billingInfo, companyId }) {
        this.id = profile.id
        this.accountId = account.id
        this.companyId = companyId
        this.customerName = customerName
        this.billingInfo = billingInfo
    }

    placeOrder(orderData) {
        return orderManager.createOrder({
          ...orderData, 
          customerId: this.id,
          companyId: this.companyId
        })
    }

    static create(customerObj) {
        console.log(`Creating a new Customer with name ${customerObj.customerName}`)

        const account = Account.create({
            email: customerObj.email,
            password: customerObj.password,
        })

        const profile = Profile.create({ accountId: account.id })

        const billingInfo = BillingInfo.create(customerObj.billingInfo)

        const newCustomer = new Customer({
            profile,
            account,
            customerName: customerObj.customerName,
            billingInfo,
            companyId: customerObj.companyId
        })
        console.log('Customer created: ', newCustomer)
        Customer.list.push(newCustomer)

        return newCustomer
    }

    static list = []
}

module.exports = Customer