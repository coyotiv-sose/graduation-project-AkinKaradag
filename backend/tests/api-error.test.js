/* eslint-disable no-undef */
const { CelebrateError, Joi, Segments } = require('celebrate')

const { classifyApiError } = require('../src/lib/api-error')
const apiErrorHandler = require('../src/middlewares/api-error-handler')
const { DomainError } = require('../src/lib/domain-error')

const originalNodeEnv = process.env.NODE_ENV

const createResponse = () => {
  const res = {}
  res.status = jest.fn().mockReturnValue(res)
  res.json = jest.fn().mockReturnValue(res)
  return res
}

const createCelebrateError = () => {
  const error = new CelebrateError(undefined, { celebrated: true })
  const validation = Joi.object({ name: Joi.string().required() }).validate({})
  error.details.set(Segments.BODY, validation.error)
  return error
}

describe('api-error', () => {
  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv
    jest.restoreAllMocks()
  })

  it('classifies cast errors as invalid request data', () => {
    expect(classifyApiError({ name: 'CastError' })).toEqual({
      status: 400,
      message: 'Invalid request data',
    })
  })

  it('uses explicit client error status and message', () => {
    expect(classifyApiError({ statusCode: 404, message: 'Missing' })).toEqual({
      status: 404,
      message: 'Missing',
    })
  })

  it('exposes server errors outside production and hides generic production errors', () => {
    process.env.NODE_ENV = 'test'
    expect(classifyApiError({ status: 503, message: 'Database down' })).toEqual({
      status: 503,
      message: 'Database down',
    })

    process.env.NODE_ENV = 'production'
    expect(classifyApiError({ status: 503, message: 'Database down' })).toEqual({
      status: 503,
      message: 'Internal server error',
    })
  })

  it('exposes production domain errors unless they opt out', () => {
    process.env.NODE_ENV = 'production'

    expect(classifyApiError(new DomainError('Upstream failed', { status: 502 }))).toEqual({
      status: 502,
      message: 'Upstream failed',
    })
    expect(classifyApiError(new DomainError('Private failure', { status: 502, expose: false }))).toEqual({
      status: 502,
      message: 'Internal server error',
    })
  })

  it('falls back to a 500 internal server error', () => {
    expect(classifyApiError({})).toEqual({
      status: 500,
      message: 'Internal server error',
    })
  })
})

describe('api-error-handler', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('passes non-api errors to the next error handler', () => {
    const error = new Error('Render me')
    const next = jest.fn()
    const res = createResponse()

    apiErrorHandler(error, { isApi: false }, res, next)

    expect(next).toHaveBeenCalledWith(error)
    expect(res.status).not.toHaveBeenCalled()
  })

  it('formats celebrate validation errors', () => {
    const res = createResponse()

    apiErrorHandler(createCelebrateError(), { isApi: true }, res, jest.fn())

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({
      error: 'Validation failed',
      details: [
        {
          segment: 'body',
          message: '"name" is required',
        },
      ],
    })
  })

  it('formats domain errors without logging them', () => {
    const res = createResponse()
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    apiErrorHandler(new DomainError('Forbidden', { status: 403 }), { isApi: true }, res, jest.fn())

    expect(consoleSpy).not.toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(403)
    expect(res.json).toHaveBeenCalledWith({ error: 'Forbidden' })
  })

  it('logs server errors before returning the classified response', () => {
    const res = createResponse()
    const error = new Error('Broken')
    error.status = 500
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    apiErrorHandler(error, { isApi: true }, res, jest.fn())

    expect(consoleSpy).toHaveBeenCalledWith(error)
    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith({ error: 'Broken' })
  })
})
