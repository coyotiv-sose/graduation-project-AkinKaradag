const Account = require('./account')
const Employee = require('./employee')

function createEmployee(employeeData) {
    const account = Account.create({
        email: employeeData.email,
        password: employeeData.password,
    })

    const employee = new Employee({
        id: Date.now() + 8,
        account,
        name: employeeData.name,
        companyId: employeeData.companyId,
        role: employeeData.role,
        profile: employeeData.profile,
    })

    return employee
}

module.exports = { createEmployee }