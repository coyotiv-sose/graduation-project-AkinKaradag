class BillingInfo{
    constructor({customerName, address, postalCode, city, VATnr}) {
        this.customerName = customerName
        this.address = address
        this.postalCode = postalCode
        this.city = city
        this.VATnr = VATnr
  }
}

module.exports = BillingInfo