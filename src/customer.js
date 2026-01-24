const orderManager = require('./orderManager')

class Customer{
  constructor({profile, account, customerName, billingInfo}) {
    this.id = profile.id
    this.accountId = account.id
    this.customerName = customerName
    this.billingInfo = billingInfo
  }

  placeOrder(company, orderData){
    return orderManager.createOrder({company, ...orderData, customerId: this.id})
  } 

}

module.exports = Customer