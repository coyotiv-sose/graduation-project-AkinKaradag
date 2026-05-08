/* eslint-disable no-undef */
jest.mock('../src/lib/order-generator', () => jest.fn())

const generateOrder = require('../src/lib/order-generator')
const { createCompany, createCustomer, clearDatabase, loginAsAdmin, app, request, mongoose } = require('./helper')
const { DomainError } = require('../src/lib/domain-error')

const generatedOrder = {
  origin: 'Zurich',
  destination: 'Geneva',
  deliveryDate: '2026-07-01T00:00:00.000Z',
  cargos: [
    {
      loadCarrierType: 'Palette',
      dimensions: { width: 1.2, length: 0.8, height: 1.5 },
      weight: 300,
      quantity: 1,
    },
  ],
}

const billingInfo = {
  customerName: 'AI Customer',
  address: 'AI Street 1',
  postalCode: '8000',
  city: 'Zurich',
  VATnr: 'VAT-AI',
}

describe('Customer AI order generation route', () => {
  let agent
  let company

  beforeEach(async () => {
    await clearDatabase()
    generateOrder.mockReset()
    agent = await loginAsAdmin()
    company = await createCompany(agent)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('creates an order from generated data using the customer default billing info', async () => {
    generateOrder.mockResolvedValue(generatedOrder)
    const customer = await createCustomer(agent, company.body._id, {
      billingInfo: [{ ...billingInfo, isDefault: true }],
    })

    const response = await agent.post(`/customers/${customer.body._id}/orders/ai-generate`).send({
      prompt: 'Ship one palette from Zurich to Geneva',
    })

    expect(response.status).toBe(201)
    expect(response.body).toMatchObject({
      origin: 'Zurich',
      destination: 'Geneva',
      billingInfo: expect.objectContaining({ VATnr: 'VAT-AI' }),
    })
    expect(generateOrder).toHaveBeenCalledWith('Ship one palette from Zurich to Geneva')
  })

  it('uses provided billing info when generating an order', async () => {
    generateOrder.mockResolvedValue(generatedOrder)
    const customer = await createCustomer(agent, company.body._id)
    await mongoose.model('Customer').findByIdAndUpdate(customer.body._id, { billingInfo: [] })

    const response = await agent.post(`/customers/${customer.body._id}/orders/ai-generate`).send({
      prompt: 'Ship one palette from Zurich to Geneva',
      billingInfo,
    })

    expect(response.status).toBe(201)
    expect(response.body.billingInfo).toMatchObject({ customerName: 'AI Customer' })
  })

  it('returns 400 when no generated order billing info is available', async () => {
    generateOrder.mockResolvedValue(generatedOrder)
    const customer = await createCustomer(agent, company.body._id)
    await mongoose.model('Customer').findByIdAndUpdate(customer.body._id, { billingInfo: [] })

    const response = await agent.post(`/customers/${customer.body._id}/orders/ai-generate`).send({
      prompt: 'Ship one palette from Zurich to Geneva',
    })

    expect(response.status).toBe(400)
    expect(response.body.error).toBe('Customer has no billing info')
  })

  it('forwards generator errors to the API error handler', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    generateOrder.mockRejectedValue(new DomainError('AI service failed', { status: 502 }))
    const customer = await createCustomer(agent, company.body._id)

    const response = await agent.post(`/customers/${customer.body._id}/orders/ai-generate`).send({
      prompt: 'Ship one palette from Zurich to Geneva',
    })

    expect(response.status).toBe(502)
    expect(response.body.error).toBe('AI service failed')
    expect(consoleSpy).toHaveBeenCalled()
  })

  it('requires authentication before generating an order', async () => {
    const customer = await createCustomer(agent, company.body._id)

    const response = await request(app).post(`/customers/${customer.body._id}/orders/ai-generate`).send({
      prompt: 'Ship one palette from Zurich to Geneva',
    })

    expect(response.status).toBe(401)
  })
})
