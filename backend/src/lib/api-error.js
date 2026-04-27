const { DomainError } = require('./domain-error')

const INTERNAL_SERVER_ERROR_MESSAGE = 'Internal server error'
const INVALID_REQUEST_MESSAGE = 'Invalid request data'

const isProduction = () => process.env.NODE_ENV === 'production'

const resolveStatusFromError = error => {
  const status = Number(error?.status || error?.statusCode)
  return Number.isInteger(status) ? status : 500
}

const isExposable = error => error instanceof DomainError && error.expose !== false

const classifyApiError = error => {
  if (error?.name === 'CastError') {
    return { status: 400, message: INVALID_REQUEST_MESSAGE }
  }

  const status = resolveStatusFromError(error)
  const message = error?.message || INTERNAL_SERVER_ERROR_MESSAGE

  if (status < 500) {
    return { status, message }
  }

  if (!isProduction() || isExposable(error)) {
    return { status, message }
  }

  return { status, message: INTERNAL_SERVER_ERROR_MESSAGE }
}

module.exports = {
  classifyApiError,
  INTERNAL_SERVER_ERROR_MESSAGE,
}
