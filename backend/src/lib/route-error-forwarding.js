const NOT_FOUND_ERROR_PATTERN = /not found/i

const attachErrorStatus = (error, status) => {
  if (!error || typeof error !== 'object') return error

  const existingStatus = Number(error.status || error.statusCode)
  const normalizedError = error

  if (!Number.isInteger(existingStatus)) {
    normalizedError.status = status
    normalizedError.statusCode = status
  }

  return normalizedError
}

const forwardRouteError = (next, error, fallbackStatus) => {
  if (NOT_FOUND_ERROR_PATTERN.test(error?.message || '')) {
    return next(attachErrorStatus(error, 404))
  }

  if (fallbackStatus) {
    return next(attachErrorStatus(error, fallbackStatus))
  }

  return next(error)
}

module.exports = {
  attachErrorStatus,
  forwardRouteError,
}
