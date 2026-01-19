class Customer{
  constructor(customerProfile, customerName, billingInfo) {
    this.id = customerProfile.id
    this.customerName = customerName
    this.billingInfo = billingInfo
  }

  placeOrder(company, orderData){
    return orderManager.createOrder({...orderData, customer: this})
  } 

}

module.exports = Customer