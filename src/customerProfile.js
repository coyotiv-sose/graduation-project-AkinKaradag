class CustomerProfile{
    constructor({id, accountId}) {
        this.id = id
        this.accountId = accountId
    }


    static create({accountId}){
        return new CustomerProfile({
            id: Date.now() + 4,
            accountId

        })
    }

}

module.exports = CustomerProfile