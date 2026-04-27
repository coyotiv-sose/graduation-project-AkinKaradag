const INTERNAL_SERVER_ERROR_MESSAGE = 'Internal server error'
const INVALID_REQUEST_MESSAGE = 'Invalid request data'

const SAFE_SERVER_ERROR_PATTERNS = [
  /not found/i,
  /already registered/i,
  /not authorized/i,
  /must contain at least one cargo/i,
  /status is not pending/i,
  /delivered orders cannot be deleted/i,
  /vehicle is not available/i,
  /new password is required/i,
]

const isProduction = () => process.env.NODE_ENV === 'production'

const isSafeServerErrorMessage = message => SAFE_SERVER_ERROR_PATTERNS.some(pattern => pattern.test(message))

const resolveStatusFromError = error => {
  const status = Number(error?.status || error?.statusCode)
  return Number.isInteger(status) ? status : 500
}

const shouldExposeServerError = message => isSafeServerErrorMessage(message)

const classifyApiError = error => {
  const message = error?.message || INTERNAL_SERVER_ERROR_MESSAGE
  let status = resolveStatusFromError(error)

  if (status >= 500 && isProduction() && error?.name === 'CastError') {
    status = 400
    return {
      status,
      message: INVALID_REQUEST_MESSAGE,
    }
  }

  if (status >= 500 && isProduction() && /not found/i.test(message)) {
    status = 404
    return {
      status,
      message,
    }
  }

  const shouldExpose = status < 500 || !isProduction() || shouldExposeServerError(message)

  return {
    status,
    message: shouldExpose ? message : INTERNAL_SERVER_ERROR_MESSAGE,
  }
}

module.exports = {
  classifyApiError,
  INTERNAL_SERVER_ERROR_MESSAGE,
}
