/* eslint-disable no-undef */
const { validatePasswordPolicy } = require('../src/lib/password-policy')

describe('Password policy', () => {
  it('accepts valid password characters and length', () => {
    expect(() => validatePasswordPolicy('SafePass12@_&')).not.toThrow()
  })

  it('rejects passwords shorter than 12', () => {
    expect(() => validatePasswordPolicy('Short1@_')).toThrow('Password length must be between 12 and 64 characters')
  })

  it('rejects characters outside allowed set', () => {
    expect(() => validatePasswordPolicy('ValidLen12*Nope')).toThrow('Password contains invalid characters')
  })

  it('rejects password containing customer name', () => {
    expect(() =>
      validatePasswordPolicy('johncustomer12_', {
        customerName: 'John Customer',
      })
    ).toThrow('Password must not contain customer, employee, or company name')
  })

  it('rejects password containing employee name', () => {
    expect(() =>
      validatePasswordPolicy('dispatcheralex12', {
        employeeName: 'Alex Dispatcher',
      })
    ).toThrow('Password must not contain customer, employee, or company name')
  })

  it('rejects password containing company name', () => {
    expect(() =>
      validatePasswordPolicy('roadrunnerlogistics12', {
        companyName: 'Road Runner Logistics',
      })
    ).toThrow('Password must not contain customer, employee, or company name')
  })
})
