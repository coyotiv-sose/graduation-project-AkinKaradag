const { isCelebrateError } = require('celebrate')

const { classifyApiError, INTERNAL_SERVER_ERROR_MESSAGE } = require('../lib/api-error')

const API_ROUTE_PREFIXES = [
  '/accounts',
  '/customers',
  '/companies',
  '/orders',
  '/vehicles',
  '/tours',
  '/employees',
  '/admin',
]

const isApiRequest = req => {
  const requestPath = req.path || req.originalUrl
  return API_ROUTE_PREFIXES.some(prefix => requestPath === prefix || requestPath.startsWith(`${prefix}/`))
}

const formatCelebrateDetails = error => {
  const details = []

  error.details.forEach((validation, segment) => {
    validation.details.forEach(item => {
      details.push({
        segment,
        message: item.message,
      })
    })
  })

  return details
}

const apiErrorHandler = (error, req, res, next) => {
  if (!isApiRequest(req)) {
    return next(error)
  }

  if (isCelebrateError(error)) {
    return res.status(400).json({
      error: 'Validation failed',
      details: formatCelebrateDetails(error),
    })
  }

  const { status, message } = classifyApiError(error)

  return res.status(status).json({
    error: message || INTERNAL_SERVER_ERROR_MESSAGE,
  })
}

module.exports = apiErrorHandler
