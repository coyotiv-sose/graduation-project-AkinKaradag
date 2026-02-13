class BillingInfo{
    constructor({customerName, address, postalCode, city, VATnr}) {
        this.customerName = customerName
        this.address = address
        this.postalCode = postalCode
        this.city = city
        this.VATnr = VATnr
  }


  static create(billingData){
    return new BillingInfo(billingData)
  }

}

module.exports = BillingInfo