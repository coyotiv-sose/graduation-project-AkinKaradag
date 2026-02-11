class Account{
    constructor({id, email, password}){
        this.id = id
        this.email = email
        this.password = password
    }

    static create(accountData){
        return new Account({
            id: Date.now() + 2,
            ...accountData
        })
    }

}

module.exports = Account