/* eslint-disable no-undef */
process.env.NODE_ENV = 'production'
process.env.SESSION_SECRET = 'test-secret'
process.env.FRONTEND_URL = 'http://allowed.example'

const mockIo = {
  engine: { use: jest.fn() },
  on: jest.fn(),
}
const mockSocketIo = jest.fn(() => mockIo)
const mockCustomerManager = {
  getCustomerByAccountId: jest.fn(),
}
const mockEmployeeManager = {
  getEmployeeByAccountId: jest.fn(),
}

jest.mock('../src/database-connection', () => {})
jest.mock('connect-mongo', () => ({
  default: {
    create: jest.fn(() => {
      const sessions = {}
      return {
        on: jest.fn(),
        get: jest.fn((sessionId, callback) => callback(null, sessions[sessionId] || null)),
        set: jest.fn((sessionId, session, callback) => {
          sessions[sessionId] = session
          if (callback) callback(null)
        }),
        destroy: jest.fn((sessionId, callback) => {
          delete sessions[sessionId]
          if (callback) callback(null)
        }),
        touch: jest.fn((sessionId, session, callback) => {
          sessions[sessionId] = session
          if (callback) callback(null)
        }),
      }
    }),
  },
}))
jest.mock('socket.io', () => mockSocketIo)
jest.mock('../src/managers/customer-manager', () => mockCustomerManager)
jest.mock('../src/managers/employee-manager', () => mockEmployeeManager)

const request = require('supertest')
const app = require('../src/app')

const createSocket = user => {
  const handlers = {}

  return {
    id: 'socket-1',
    request: { user },
    join: jest.fn(),
    leave: jest.fn(),
    on: jest.fn((event, handler) => {
      handlers[event] = handler
    }),
    handlers,
  }
}

const getConnectionHandler = () => mockIo.on.mock.calls.find(([event]) => event === 'connection')[1]

describe('app bootstrap', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('sets production trust proxy and accepts allowed CORS origins', async () => {
    const response = await request(app).get('/missing-page').set('Origin', 'http://allowed.example')

    expect(app.get('trust proxy')).toBe(1)
    expect(response.headers['access-control-allow-origin']).toBe('http://allowed.example')
  })

  it('rejects disallowed CORS origins', async () => {
    const response = await request(app).get('/missing-page').set('Origin', 'http://blocked.example')

    expect(response.status).toBe(500)
  })

  it('renders the non-api 404 error page', async () => {
    const response = await request(app).get('/missing-page')

    expect(response.status).toBe(404)
    expect(response.text).toContain('Not Found')
  })

  it('renders the home page', async () => {
    const response = await request(app).get('/')

    expect(response.status).toBe(200)
    expect(response.text).toContain('RouteWerk')
  })
})

describe('app socket server', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    app.createSocketServer({})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('creates socket.io with shared middleware', () => {
    expect(mockSocketIo).toHaveBeenCalledWith(
      {},
      expect.objectContaining({
        cors: expect.objectContaining({ credentials: true }),
      })
    )
    expect(app.io).toBe(mockIo)
    expect(mockIo.engine.use).toHaveBeenCalledTimes(3)
    expect(mockIo.on).toHaveBeenCalledWith('connection', expect.any(Function))
  })

  it('joins customer rooms and order rooms', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {})
    mockCustomerManager.getCustomerByAccountId.mockResolvedValue({ _id: 'customer1' })
    const socket = createSocket({ _id: 'account1', role: 'customer' })

    await getConnectionHandler()(socket)
    socket.handlers['join:order']('order1')
    socket.handlers['leave:order']('order1')
    socket.handlers.disconnect()

    expect(socket.join).toHaveBeenCalledWith('customer:customer1')
    expect(socket.join).toHaveBeenCalledWith('order:order1')
    expect(socket.leave).toHaveBeenCalledWith('order:order1')
    expect(consoleSpy).toHaveBeenCalledWith('A account disconnected:', 'socket-1')
  })

  it('joins employee company rooms', async () => {
    jest.spyOn(console, 'log').mockImplementation(() => {})
    mockEmployeeManager.getEmployeeByAccountId.mockResolvedValue({ company: 'company1' })
    const socket = createSocket({ _id: 'account1', role: 'employee' })

    await getConnectionHandler()(socket)

    expect(socket.join).toHaveBeenCalledWith('company:company1')
  })

  it('logs auto-join errors without rejecting the connection', async () => {
    jest.spyOn(console, 'log').mockImplementation(() => {})
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    mockCustomerManager.getCustomerByAccountId.mockRejectedValue(new Error('profile missing'))
    const socket = createSocket({ _id: 'account1', role: 'customer' })

    await getConnectionHandler()(socket)

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Failed to auto-join rooms for account:',
      'account1',
      'profile missing'
    )
  })

  it('registers socket handlers for anonymous connections', async () => {
    jest.spyOn(console, 'log').mockImplementation(() => {})
    const socket = createSocket(null)

    await getConnectionHandler()(socket)

    expect(socket.on).toHaveBeenCalledWith('join:order', expect.any(Function))
    expect(socket.on).toHaveBeenCalledWith('leave:order', expect.any(Function))
    expect(socket.on).toHaveBeenCalledWith('disconnect', expect.any(Function))
  })
})
