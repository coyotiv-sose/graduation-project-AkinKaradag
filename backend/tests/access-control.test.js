/* eslint-disable no-undef */
const mongoose = require('mongoose')

const {
  getEntityId,
  idsEqual,
  resolveAccountScope,
  canAccessCompany,
  canAccessCustomer,
  canAccessEmployee,
  canAccessOrder,
  canAccessVehicle,
  canAccessTour,
  isResourceInCompany,
} = require('../src/lib/access-control')

describe('access-control', () => {
  it('normalizes common entity id shapes', () => {
    const objectId = new mongoose.Types.ObjectId()
    const valueObject = { valueOf: () => objectId.toString() }

    expect(getEntityId(null)).toBeNull()
    expect(getEntityId(undefined)).toBeNull()
    expect(getEntityId(123)).toBe('123')
    expect(getEntityId(objectId)).toBe(objectId.toString())
    expect(getEntityId({ _id: objectId })).toBe(objectId.toString())
    expect(getEntityId(valueObject)).toBe(objectId.toString())
    expect(getEntityId({ valueOf: () => undefined })).toBeNull()
    expect(getEntityId({})).toBeNull()
  })

  it('compares normalized ids', () => {
    const objectId = new mongoose.Types.ObjectId()

    expect(idsEqual(objectId, objectId.toString())).toBe(true)
    expect(idsEqual(objectId, new mongoose.Types.ObjectId())).toBe(false)
    expect(idsEqual(null, objectId)).toBe(false)
  })

  it('resolves account scopes for anonymous, admin, customer, and employee accounts', async () => {
    const accountId = new mongoose.Types.ObjectId()
    const customerId = new mongoose.Types.ObjectId()
    const employeeId = new mongoose.Types.ObjectId()
    const companyId = new mongoose.Types.ObjectId()

    await expect(resolveAccountScope(null)).resolves.toBeNull()
    await expect(resolveAccountScope({ _id: accountId, role: 'admin' })).resolves.toEqual({
      role: 'admin',
      accountId: accountId.toString(),
    })

    await expect(
      resolveAccountScope(
        { _id: accountId, role: 'customer' },
        {
          customerManager: {
            getCustomerByAccountId: jest.fn().mockResolvedValue({ _id: customerId, company: companyId }),
          },
        }
      )
    ).resolves.toEqual({
      role: 'customer',
      accountId: accountId.toString(),
      customerId: customerId.toString(),
      companyId: companyId.toString(),
    })

    await expect(
      resolveAccountScope(
        { _id: accountId, role: 'employee' },
        {
          employeeManager: {
            getEmployeeByAccountId: jest.fn().mockResolvedValue({ _id: employeeId, company: companyId }),
          },
        }
      )
    ).resolves.toEqual({
      role: 'employee',
      accountId: accountId.toString(),
      employeeId: employeeId.toString(),
      companyId: companyId.toString(),
    })
  })

  it('requires role managers when resolving profile-backed account scopes', async () => {
    await expect(resolveAccountScope({ _id: 'account1', role: 'customer' })).rejects.toThrow(
      'Customer manager is required for Customer scope resolution'
    )
    await expect(resolveAccountScope({ _id: 'account1', role: 'employee' })).rejects.toThrow(
      'Employee manager is required for Employee scope resolution'
    )
  })

  it('checks company scoped access by role and resource ownership', () => {
    const companyId = new mongoose.Types.ObjectId()
    const otherCompanyId = new mongoose.Types.ObjectId()
    const customerId = new mongoose.Types.ObjectId()
    const employeeId = new mongoose.Types.ObjectId()
    const vehicleId = new mongoose.Types.ObjectId()
    const tourId = new mongoose.Types.ObjectId()
    const orderId = new mongoose.Types.ObjectId()

    const adminScope = { role: 'admin' }
    const customerScope = { role: 'customer', customerId: customerId.toString(), companyId: companyId.toString() }
    const employeeScope = { role: 'employee', employeeId: employeeId.toString(), companyId: companyId.toString() }
    const unknownScope = { role: 'auditor', companyId: companyId.toString() }

    expect(canAccessCompany(adminScope, otherCompanyId)).toBe(true)
    expect(canAccessCompany(employeeScope, companyId)).toBe(true)
    expect(canAccessCompany(employeeScope, otherCompanyId)).toBe(false)
    expect(canAccessCompany(customerScope, companyId)).toBe(false)
    expect(canAccessCompany(null, companyId)).toBe(false)
    expect(canAccessCompany(unknownScope, companyId)).toBe(false)

    expect(canAccessCustomer(customerScope, { _id: customerId, company: otherCompanyId })).toBe(true)
    expect(canAccessCustomer(customerScope, { _id: new mongoose.Types.ObjectId(), company: companyId })).toBe(false)
    expect(canAccessCustomer(employeeScope, { _id: customerId, company: companyId })).toBe(true)
    expect(canAccessCustomer(employeeScope, { _id: customerId, company: otherCompanyId })).toBe(false)

    expect(canAccessEmployee(employeeScope, { _id: employeeId, company: companyId })).toBe(true)
    expect(canAccessEmployee(employeeScope, { _id: employeeId, company: otherCompanyId })).toBe(false)

    expect(canAccessOrder(customerScope, { _id: orderId, customer: customerId, company: otherCompanyId })).toBe(true)
    expect(
      canAccessOrder(customerScope, { _id: orderId, customer: new mongoose.Types.ObjectId(), company: companyId })
    ).toBe(false)
    expect(canAccessOrder(employeeScope, { _id: orderId, customer: customerId, company: companyId })).toBe(true)
    expect(canAccessOrder(employeeScope, { _id: orderId, customer: customerId, company: otherCompanyId })).toBe(false)

    expect(canAccessVehicle(employeeScope, { _id: vehicleId, company: companyId })).toBe(true)
    expect(canAccessVehicle(employeeScope, { _id: vehicleId, company: otherCompanyId })).toBe(false)

    expect(canAccessTour(employeeScope, { _id: tourId, company: companyId })).toBe(true)
    expect(canAccessTour(employeeScope, { _id: tourId, company: otherCompanyId })).toBe(false)

    expect(isResourceInCompany({ company: companyId }, companyId.toString())).toBe(true)
    expect(isResourceInCompany({ company: otherCompanyId }, companyId.toString())).toBe(false)
  })
})
