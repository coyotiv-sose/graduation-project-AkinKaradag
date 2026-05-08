/* eslint-disable no-undef */
const express = require('express')
const request = require('supertest')

const mockCompanyManager = {
  getAllCompanies: jest.fn(),
  getPublicCompanies: jest.fn(),
  createCompany: jest.fn(),
  updateCompany: jest.fn(),
  deleteCompany: jest.fn(),
  getCompanyById: jest.fn(),
}
const mockCustomerManager = {
  getAllCustomers: jest.fn(),
  createCustomer: jest.fn(),
  getCustomerByCompany: jest.fn(),
  getCustomerById: jest.fn(),
  updateCustomerByCompany: jest.fn(),
  deleteCustomerByCompany: jest.fn(),
  resetCustomerPasswordByCompany: jest.fn(),
}
const mockEmployeeManager = {
  getAllEmployees: jest.fn(),
  createEmployee: jest.fn(),
  getEmployeeByCompany: jest.fn(),
  getEmployeeById: jest.fn(),
  updateEmployeeByCompany: jest.fn(),
  deleteEmployeeByCompany: jest.fn(),
  resetEmployeePasswordByCompany: jest.fn(),
}
const mockOrderManager = {
  getOrders: jest.fn(),
  createOrder: jest.fn(),
  getOrdersByCompany: jest.fn(),
  getOrdersByCustomer: jest.fn(),
  getOrdersByCustomerFromCompany: jest.fn(),
  findOrderById: jest.fn(),
  updateOrder: jest.fn(),
  deleteOrderByCompany: jest.fn(),
  deleteOrderByCustomer: jest.fn(),
  addCargoToOrder: jest.fn(),
  getCargosFromOrder: jest.fn(),
}
const mockVehicleManager = {
  createVehicle: jest.fn(),
  getAllVehiclesOfCompany: jest.fn(),
  findVehicleById: jest.fn(),
  updateVehicle: jest.fn(),
}
const mockTourManager = {
  createTour: jest.fn(),
  getAllToursByCompany: jest.fn(),
  findTourById: jest.fn(),
  addOrderToTour: jest.fn(),
  updateTour: jest.fn(),
  getCargosByTour: jest.fn(),
  assignVehicleToTour: jest.fn(),
}

jest.mock('../src/managers/company-manager', () => mockCompanyManager)
jest.mock('../src/managers/customer-manager', () => mockCustomerManager)
jest.mock('../src/managers/employee-manager', () => mockEmployeeManager)
jest.mock('../src/managers/order-manager', () => mockOrderManager)
jest.mock('../src/managers/vehicle-manager', () => mockVehicleManager)
jest.mock('../src/managers/tour-manager', () => mockTourManager)

const adminRouter = require('../src/routes/admin')
const companiesRouter = require('../src/routes/companies')
const customersRouter = require('../src/routes/customers')
const ordersRouter = require('../src/routes/orders')
const toursRouter = require('../src/routes/tours')

const companyId = '507f1f77bcf86cd799439011'
const customerId = '507f1f77bcf86cd799439012'
const employeeId = '507f1f77bcf86cd799439013'
const orderId = '507f1f77bcf86cd799439014'
const vehicleId = '507f1f77bcf86cd799439015'
const tourId = '507f1f77bcf86cd799439016'

const failure = () => {
  const error = new Error('manager failed')
  error.status = 503
  return error
}

const makeApp = (mountPath, router) => {
  const app = express()
  app.use(express.json())
  app.use((req, res, next) => {
    req.user = { _id: 'admin-account', role: 'admin' }
    next()
  })
  app.use(mountPath, router)
  // Express recognizes error middleware by arity; the fourth argument is intentionally unused.
  // eslint-disable-next-line no-unused-vars
  app.use((error, req, res, _next) => {
    res.status(error.status || 500).json({ error: error.message })
  })
  return app
}

const routeRequest = (app, method, path) => request(app)[method](path)

const billingInfo = {
  customerName: 'Customer One',
  address: 'Street 1',
  postalCode: '8000',
  city: 'Zurich',
  VATnr: 'VAT-001',
}

const cargo = {
  loadCarrierType: 'Palette',
  dimensions: { width: 1, length: 1, height: 1 },
  weight: 100,
  quantity: 1,
}

describe('route error paths', () => {
  let adminApp
  let companiesApp
  let customersApp
  let ordersApp
  let toursApp

  beforeEach(() => {
    jest.clearAllMocks()
    adminApp = makeApp('/admin', adminRouter)
    companiesApp = makeApp('/companies', companiesRouter)
    customersApp = makeApp('/customers', customersRouter)
    ordersApp = makeApp('/orders', ordersRouter)
    toursApp = makeApp('/tours', toursRouter)
  })

  describe('admin route manager failures', () => {
    it.each([
      ['get', '/admin/companies', mockCompanyManager.getAllCompanies, null],
      [
        'post',
        '/admin/companies',
        mockCompanyManager.createCompany,
        {
          companyName: 'Company',
          address: 'Street 1',
          postalCode: '8000',
          city: 'Zurich',
        },
      ],
      ['put', `/admin/companies/${companyId}`, mockCompanyManager.updateCompany, { city: 'Bern' }],
      ['delete', `/admin/companies/${companyId}`, mockCompanyManager.deleteCompany, null],
      ['get', '/admin/customers', mockCustomerManager.getAllCustomers, null],
      [
        'put',
        `/admin/customers/${customerId}`,
        mockCustomerManager.updateCustomerByCompany,
        {
          company: companyId,
          customerName: 'Updated',
        },
      ],
      ['delete', `/admin/customers/${customerId}`, mockCustomerManager.deleteCustomerByCompany, { company: companyId }],
      ['get', '/admin/orders', mockOrderManager.getOrders, null],
      ['put', `/admin/orders/${orderId}`, mockOrderManager.updateOrder, { origin: 'Bern' }],
      ['delete', `/admin/orders/${orderId}`, mockOrderManager.deleteOrderByCompany, { company: companyId }],
      ['get', '/admin/employees', mockEmployeeManager.getAllEmployees, null],
      [
        'put',
        `/admin/employees/${employeeId}`,
        mockEmployeeManager.updateEmployeeByCompany,
        {
          company: companyId,
          name: 'Updated',
        },
      ],
      ['delete', `/admin/employees/${employeeId}`, mockEmployeeManager.deleteEmployeeByCompany, { company: companyId }],
      [
        'post',
        `/admin/customers/${customerId}/reset-password`,
        mockCustomerManager.resetCustomerPasswordByCompany,
        {
          company: companyId,
          newPassword: 'FreshPass1234',
        },
      ],
      [
        'post',
        `/admin/employees/${employeeId}/reset-password`,
        mockEmployeeManager.resetEmployeePasswordByCompany,
        {
          company: companyId,
          newPassword: 'FreshStaff1234',
        },
      ],
    ])('forwards %s %s manager failures', async (method, path, managerMethod, body) => {
      managerMethod.mockRejectedValue(failure())

      const response = await routeRequest(adminApp, method, path).send(body || {})

      expect(response.status).toBe(503)
      expect(response.body.error).toBe('manager failed')
    })
  })

  describe('company route manager failures', () => {
    it('forwards public company list failures', async () => {
      mockCompanyManager.getPublicCompanies.mockRejectedValue(failure())

      const response = await request(companiesApp).get('/companies/public')

      expect(response.status).toBe(503)
    })

    it('forwards company detail failures', async () => {
      mockCompanyManager.getCompanyById.mockRejectedValue(failure())

      const response = await request(companiesApp).get(`/companies/${companyId}`)

      expect(response.status).toBe(503)
    })

    it('forwards customer create and list failures', async () => {
      mockCustomerManager.createCustomer.mockRejectedValue(failure())
      mockCustomerManager.getCustomerByCompany.mockRejectedValue(failure())

      const create = await request(companiesApp).post(`/companies/${companyId}/customers`).send({
        customerName: 'Customer One',
        email: 'customer@example.com',
        password: 'SafePass1234',
      })
      const list = await request(companiesApp).get(`/companies/${companyId}/customers`)

      expect(create.status).toBe(503)
      expect(list.status).toBe(503)
    })

    it('forwards customer update, delete, and password reset failures', async () => {
      mockCustomerManager.getCustomerById.mockResolvedValue({ _id: customerId, company: companyId })
      mockCustomerManager.updateCustomerByCompany.mockRejectedValue(failure())
      mockCustomerManager.deleteCustomerByCompany.mockRejectedValue(failure())
      mockCustomerManager.resetCustomerPasswordByCompany.mockRejectedValue(failure())

      const update = await request(companiesApp)
        .put(`/companies/${companyId}/customers/${customerId}`)
        .send({ customerName: 'Updated' })
      const deletion = await request(companiesApp).delete(`/companies/${companyId}/customers/${customerId}`)
      const reset = await request(companiesApp)
        .post(`/companies/${companyId}/customers/${customerId}/reset-password`)
        .send({ newPassword: 'FreshPass1234' })

      expect(update.status).toBe(503)
      expect(deletion.status).toBe(503)
      expect(reset.status).toBe(503)
    })

    it('forwards employee create, list, update, delete, and password reset failures', async () => {
      mockEmployeeManager.getEmployeeById.mockResolvedValue({ _id: employeeId, company: companyId })
      mockEmployeeManager.createEmployee.mockRejectedValue(failure())
      mockEmployeeManager.getEmployeeByCompany.mockRejectedValue(failure())
      mockEmployeeManager.updateEmployeeByCompany.mockRejectedValue(failure())
      mockEmployeeManager.deleteEmployeeByCompany.mockRejectedValue(failure())
      mockEmployeeManager.resetEmployeePasswordByCompany.mockRejectedValue(failure())

      const create = await request(companiesApp).post(`/companies/${companyId}/employees`).send({
        name: 'Employee One',
        email: 'employee@example.com',
        password: 'StaffSafe1234',
      })
      const list = await request(companiesApp).get(`/companies/${companyId}/employees`)
      const update = await request(companiesApp)
        .put(`/companies/${companyId}/employees/${employeeId}`)
        .send({ name: 'Updated' })
      const deletion = await request(companiesApp).delete(`/companies/${companyId}/employees/${employeeId}`)
      const reset = await request(companiesApp)
        .post(`/companies/${companyId}/employees/${employeeId}/reset-password`)
        .send({ newPassword: 'FreshStaff1234' })

      expect(create.status).toBe(503)
      expect(list.status).toBe(503)
      expect(update.status).toBe(503)
      expect(deletion.status).toBe(503)
      expect(reset.status).toBe(503)
    })

    it('forwards order create, list, delete, and customer-order list failures', async () => {
      mockCustomerManager.getCustomerById.mockResolvedValue({ _id: customerId, company: companyId })
      mockOrderManager.findOrderById.mockResolvedValue({ _id: orderId, customer: customerId, company: companyId })
      mockOrderManager.createOrder.mockRejectedValue(failure())
      mockOrderManager.getOrdersByCompany.mockRejectedValue(failure())
      mockOrderManager.deleteOrderByCompany.mockRejectedValue(failure())
      mockOrderManager.getOrdersByCustomerFromCompany.mockRejectedValue(failure())

      const create = await request(companiesApp)
        .post(`/companies/${companyId}/orders`)
        .send({
          origin: 'Zurich',
          destination: 'Bern',
          deliveryDate: '2026-07-01T00:00:00.000Z',
          customer: customerId,
          billingInfo,
          cargos: [cargo],
        })
      const list = await request(companiesApp).get(`/companies/${companyId}/orders`)
      const deletion = await request(companiesApp).delete(`/companies/${companyId}/orders/${orderId}`)
      const customerOrders = await request(companiesApp).get(`/companies/${companyId}/customers/${customerId}/orders`)

      expect(create.status).toBe(503)
      expect(list.status).toBe(503)
      expect(deletion.status).toBe(503)
      expect(customerOrders.status).toBe(503)
    })

    it('forwards vehicle create, list, and update failures', async () => {
      mockVehicleManager.findVehicleById.mockResolvedValue({ _id: vehicleId, company: companyId })
      mockVehicleManager.createVehicle.mockRejectedValue(failure())
      mockVehicleManager.getAllVehiclesOfCompany.mockRejectedValue(failure())
      mockVehicleManager.updateVehicle.mockRejectedValue(failure())

      const create = await request(companiesApp).post(`/companies/${companyId}/vehicles`).send({
        brand: 'Mercedes',
        model: 'Sprinter',
        year: 2020,
        payLoad: 1200,
      })
      const list = await request(companiesApp).get(`/companies/${companyId}/vehicles`)
      const update = await request(companiesApp)
        .put(`/companies/${companyId}/vehicles/${vehicleId}`)
        .send({ state: 'IN_GARAGE' })

      expect(create.status).toBe(503)
      expect(list.status).toBe(503)
      expect(update.status).toBe(503)
    })

    it('forwards tour create, list, add-order, and update failures', async () => {
      mockTourManager.findTourById.mockResolvedValue({ _id: tourId, company: companyId })
      mockOrderManager.findOrderById.mockResolvedValue({ _id: orderId, customer: customerId, company: companyId })
      mockTourManager.createTour.mockRejectedValue(failure())
      mockTourManager.getAllToursByCompany.mockRejectedValue(failure())
      mockTourManager.addOrderToTour.mockRejectedValue(failure())
      mockTourManager.updateTour.mockRejectedValue(failure())

      const create = await request(companiesApp).post(`/companies/${companyId}/tours`).send({
        date: '2026-07-01T00:00:00.000Z',
      })
      const list = await request(companiesApp).get(`/companies/${companyId}/tours`)
      const addOrder = await request(companiesApp).post(`/companies/${companyId}/tours/${tourId}`).send({ orderId })
      const update = await request(companiesApp)
        .put(`/companies/${companyId}/tours/${tourId}`)
        .send({ startLocation: 'Zurich' })

      expect(create.status).toBe(503)
      expect(list.status).toBe(503)
      expect(addOrder.status).toBe(503)
      expect(update.status).toBe(503)
    })
  })

  describe('customer route manager failures', () => {
    beforeEach(() => {
      mockCustomerManager.getCustomerById.mockResolvedValue({ _id: customerId, company: companyId })
      mockOrderManager.findOrderById.mockResolvedValue({ _id: orderId, customer: customerId, company: companyId })
    })

    it('forwards order create, list, and cargo failures', async () => {
      mockOrderManager.createOrder.mockRejectedValue(failure())
      mockOrderManager.getOrdersByCustomer.mockRejectedValue(failure())
      mockOrderManager.addCargoToOrder.mockRejectedValue(failure())

      const create = await request(customersApp)
        .post(`/customers/${customerId}/orders`)
        .send({
          origin: 'Zurich',
          destination: 'Bern',
          deliveryDate: '2026-07-01T00:00:00.000Z',
          billingInfo,
          cargos: [cargo],
        })
      const list = await request(customersApp).get(`/customers/${customerId}/orders`)
      const addCargo = await request(customersApp).post(`/customers/${customerId}/orders/${orderId}/cargos`).send(cargo)

      expect(create.status).toBe(503)
      expect(list.status).toBe(503)
      expect(addCargo.status).toBe(503)
    })
  })

  describe('standalone order and tour route manager failures', () => {
    it('forwards order cargo failures', async () => {
      mockOrderManager.findOrderById.mockResolvedValue({ _id: orderId, customer: customerId, company: companyId })
      mockOrderManager.getCargosFromOrder.mockRejectedValue(failure())

      const response = await request(ordersApp).get(`/orders/${orderId}/cargos`)

      expect(response.status).toBe(503)
    })

    it('forwards tour cargo failures', async () => {
      mockTourManager.findTourById.mockResolvedValue({ _id: tourId, company: companyId })
      mockTourManager.getCargosByTour.mockRejectedValue(failure())

      const response = await request(toursApp).get(`/tours/${tourId}/cargos`)

      expect(response.status).toBe(503)
    })
  })
})
