/* eslint-disable no-undef */
const { attachErrorStatus, NOT_FOUND_ERROR_PATTERN } = require('../src/lib/route-error-forwarding')

describe('route-error-forwarding', () => {
  it('returns non-object errors unchanged', () => {
    expect(attachErrorStatus(null, 404)).toBeNull()
    expect(attachErrorStatus('boom', 404)).toBe('boom')
  })

  it('adds status when the error does not already have one', () => {
    const error = new Error('Missing')

    expect(attachErrorStatus(error, 404)).toBe(error)
    expect(error.status).toBe(404)
    expect(error.statusCode).toBe(404)
  })

  it('keeps existing status values', () => {
    const error = new Error('Forbidden')
    error.status = 403

    attachErrorStatus(error, 404)

    expect(error.status).toBe(403)
    expect(error.statusCode).toBeUndefined()
  })

  it('matches not found errors case-insensitively', () => {
    expect(NOT_FOUND_ERROR_PATTERN.test('Customer not found')).toBe(true)
    expect(NOT_FOUND_ERROR_PATTERN.test('CUSTOMER NOT FOUND')).toBe(true)
    expect(NOT_FOUND_ERROR_PATTERN.test('Forbidden')).toBe(false)
  })
})
