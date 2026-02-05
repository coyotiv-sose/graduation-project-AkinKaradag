const orderManager = require('./orderManager')
const Account = require('./account')
const Profile = require('./customerProfile')
const BillingInfo = require('./billingInfo')

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
  
  
    static create(customerObj) {
     console.log(`Creating a new Customer with name ${customerObj.customerName}`)

     const account = new Account({
      id: 32423,
      email: 'customer4@mail.com',
      password: 'shouldNotBeVisible'
     })

     const profile = new Profile({
      customerName: customerObj.customerName,
      
     })

     const billingInfo = new BillingInfo({
      customerName: customerObj.customerName,
      address: 'TestAddress 123',
      postalCode: '1234',
      city: 'TestCity',
      VATnr: 'TEST1234'
     })

     const newCustomer = new Customer({
      profile: profile,
      account: account,
      customerName: customerObj.customerName,
      billingInfo: billingInfo
     })
     console.log('Customer created: ', newCustomer)
     Customer.list.push(newCustomer)
    
     return newCustomer
    }
  
    static list = []
}

module.exports = Customer