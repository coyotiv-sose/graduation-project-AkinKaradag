const orderManager = require('./orderManager')

class Customer {
    constructor({ id, account, customerName, billingInfo, companyId }) {
        this.id = id
        this.accountId = account.id
        this.companyId = companyId
        this.customerName = customerName
        this.billingInfo = billingInfo
        this.profile = 'CUSTOMER_DEFAULT'
    }

    placeOrder(orderData) {
        return orderManager.createOrder({
            ...orderData,
            customerId: this.id,
            companyId: this.companyId,
        })
    }
}

module.exports = Customer