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

module.exports = {
  NOT_FOUND_ERROR_PATTERN,
  attachErrorStatus,
}
