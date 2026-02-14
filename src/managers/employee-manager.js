const Account = require('./account')
const Employee = require('./employee')

const createEmployee = async employeeData => {
    const exist = await Account.findOne({ email: employeeData.email })
    if (exist) throw new Error('Email already registered')

    const account = await Account.create({
        email: employeeData.email,
        password: employeeData.password,
        role: 'employee',
    })

    const employee = await Employee.create({
        account: account._id,
        name: employeeData.name,
        company: employeeData.company,
        profile: 'DISPATCHER',
    })

    return employee
}

const getEmployeeById = async employeeId => {
    const employee = await Employee.findById(employeeId)
    if (!employee) throw new Error('Employee not found')
    return employee
}

const getEmployeeByCompany = companyId => Employee.find({ company: companyId })

const getAllEmployees = () => Employee.find()

module.exports = { createEmployee, getEmployeeByCompany, getEmployeeById, getAllEmployees }