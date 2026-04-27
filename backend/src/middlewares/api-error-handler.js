const { isCelebrateError } = require('celebrate')

const { classifyApiError, INTERNAL_SERVER_ERROR_MESSAGE } = require('../lib/api-error')

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

// eslint-disable-next-line no-unused-vars
const apiErrorHandler = (error, req, res, next) => {
  if (!req.isApi) {
    return next(error)
  }

  if (isCelebrateError(error)) {
    return res.status(400).json({
      error: 'Validation failed',
      details: formatCelebrateDetails(error),
    })
  }

  const { status, message } = classifyApiError(error)

  if (status >= 500) {
    // eslint-disable-next-line no-console
    console.error(error)
  }

  return res.status(status).json({
    error: message || INTERNAL_SERVER_ERROR_MESSAGE,
  })
}

module.exports = apiErrorHandler
