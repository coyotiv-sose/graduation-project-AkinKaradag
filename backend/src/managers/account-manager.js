const Account = require('../models/account')
const { validatePasswordPolicy } = require('../lib/password-policy')

const getAccountByEmail = async email => Account.findOne({ email: String(email || '').toLowerCase() })

const createAdminAccount = async ({ email, password }) => {
  validatePasswordPolicy(password)

  const existingAccount = await getAccountByEmail(email)
  if (existingAccount) throw new Error('Email already registered')

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

module.exports = {
  getAccountByEmail,
  createAdminAccount,
  isAccountLoginLocked,
  registerFailedLoginAttempt,
  resetFailedLoginAttempts,
}
