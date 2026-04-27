class DomainError extends Error {
  constructor(message, { status = 400, expose = true, code } = {}) {
    super(message)
    this.name = 'DomainError'
    this.status = status
    this.statusCode = status
    this.expose = expose
    if (code) this.code = code
  }
}

module.exports = {
  DomainError,
}
