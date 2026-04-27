const { DomainError } = require('./domain-error')

const PASSWORD_MIN_LENGTH = 12
const PASSWORD_MAX_LENGTH = 64
const PASSWORD_ALLOWED_SPECIAL_CHARACTERS = '@!-_$&'
const PASSWORD_ALLOWED_REGEX = /^[A-Za-z0-9@!_\-$&]+$/

const passwordPolicyError = message => new DomainError(message, { status: 400 })

const normalizeForComparison = value => String(value || '')
  .toLowerCase()
  .replace(/[^a-z0-9]/g, '')

const getNameFragments = names => {
  const fragments = new Set()

  names
    .filter(Boolean)
    .forEach(name => {
      const normalizedName = normalizeForComparison(name)
      if (normalizedName.length >= 3) {
        fragments.add(normalizedName)
      }

      String(name)
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .map(fragment => normalizeForComparison(fragment))
        .filter(fragment => fragment.length >= 3)
        .forEach(fragment => fragments.add(fragment))
    })

  return [...fragments]
}

const validatePasswordPolicy = (password, { customerName, employeeName, companyName } = {}) => {
  if (typeof password !== 'string' || !password) {
    throw passwordPolicyError('Password is required')
  }

  if (password.length < PASSWORD_MIN_LENGTH || password.length > PASSWORD_MAX_LENGTH) {
    throw passwordPolicyError(
      `Password length must be between ${PASSWORD_MIN_LENGTH} and ${PASSWORD_MAX_LENGTH} characters`
    )
  }

  if (!PASSWORD_ALLOWED_REGEX.test(password)) {
    throw passwordPolicyError(
      `Password contains invalid characters. Allowed special characters are ${PASSWORD_ALLOWED_SPECIAL_CHARACTERS}`
    )
  }

  const passwordValue = normalizeForComparison(password)
  const nameFragments = getNameFragments([customerName, employeeName, companyName])
  const containsNameFragment = nameFragments.some(fragment => passwordValue.includes(fragment))

  if (containsNameFragment) {
    throw passwordPolicyError('Password must not contain customer, employee, or company name')
  }
}

module.exports = {
  PASSWORD_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
  PASSWORD_ALLOWED_SPECIAL_CHARACTERS,
  PASSWORD_ALLOWED_REGEX,
  validatePasswordPolicy,
}
