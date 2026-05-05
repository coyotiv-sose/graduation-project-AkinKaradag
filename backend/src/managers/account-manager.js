const crypto = require('crypto')
const Account = require('../models/account')
const { validatePasswordPolicy } = require('../lib/password-policy')
const { DomainError } = require('../lib/domain-error')

const DUMMY_HASH_ITERATIONS = 25000
const DUMMY_HASH_KEYLEN = 512
const DUMMY_HASH_DIGEST = 'sha256'
const DUMMY_HASH_SALT = crypto.randomBytes(32)
const DUMMY_HASH_PASSWORD = 'dummy-password'

const runDummyPasswordHash = () =>
  new Promise((resolve, reject) => {
    crypto.pbkdf2(
      DUMMY_HASH_PASSWORD,
      DUMMY_HASH_SALT,
      DUMMY_HASH_ITERATIONS,
      DUMMY_HASH_KEYLEN,
      DUMMY_HASH_DIGEST,
      err => (err ? reject(err) : resolve())
    )
  })

const normalizeEmail = email =>
  String(email || '')
    .trim()
    .toLowerCase()

const getAccountByEmail = async email => Account.findOne({ email: normalizeEmail(email) })

const createAdminAccount = async ({ email, password }) => {
  validatePasswordPolicy(password)

  const existingAccount = await getAccountByEmail(email)
  if (existingAccount) throw new DomainError('Email already registered', { status: 409 })

  const account = await Account.register(
    new Account({
      email,
      role: 'admin',
    }),
    password
  )

  return account
}

const isAccountLoginLocked = account => Boolean(account && account.isLoginLocked())

const registerFailedLoginAttempt = async account => {
  if (!account) return false
  return account.registerFailedLoginAttempt()
}

const resetFailedLoginAttempts = async account => {
  if (!account) return null
  return account.resetFailedLoginAttempts()
}

const verifyAccountPassword = async (account, password) => {
  if (!account || account.isLoginLocked()) {
    await runDummyPasswordHash()
    return { success: false }
  }
  const { user } = await account.authenticate(password)
  if (!user) return { success: false }
  return { success: true, user }
}

module.exports = {
  getAccountByEmail,
  createAdminAccount,
  isAccountLoginLocked,
  registerFailedLoginAttempt,
  resetFailedLoginAttempts,
  verifyAccountPassword,
}
