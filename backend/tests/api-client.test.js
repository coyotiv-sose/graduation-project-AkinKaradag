/* eslint-disable no-undef */
const api = require('../src/api')

describe('api client', () => {
  it('uses the backend base URL', () => {
    expect(api.defaults.baseURL).toBe('http://localhost:3000')
  })
})
