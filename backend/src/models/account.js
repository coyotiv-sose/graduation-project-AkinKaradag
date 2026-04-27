const mongoose = require('mongoose')
const { default: passportLocalMongoose } = require('passport-local-mongoose')

const MAX_FAILED_LOGIN_ATTEMPTS = Number(process.env.MAX_FAILED_LOGIN_ATTEMPTS || 3)
const LOGIN_LOCK_TIME_MINUTES = Number(process.env.LOGIN_LOCK_TIME_MINUTES || 15)

const accountSchema = new mongoose.Schema({
  email: { type: String, required: true, lowercase: true },
  role: { type: String, enum: ['customer', 'employee', 'admin'], required: true },
  failedLoginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date, default: null },
})

accountSchema.methods.isLoginLocked = function () {
  return Boolean(this.lockUntil && this.lockUntil.getTime() > Date.now())
}

accountSchema.methods.registerFailedLoginAttempt = async function () {
  const isLockExpired = this.lockUntil && this.lockUntil.getTime() <= Date.now()
  if (isLockExpired) {
    this.failedLoginAttempts = 0
    this.lockUntil = null
  }

  this.failedLoginAttempts = (this.failedLoginAttempts || 0) + 1

  if (this.failedLoginAttempts >= MAX_FAILED_LOGIN_ATTEMPTS) {
    this.failedLoginAttempts = 0
    this.lockUntil = new Date(Date.now() + LOGIN_LOCK_TIME_MINUTES * 60 * 1000)
  }

  await this.save()
  return this.isLoginLocked()
}

accountSchema.methods.resetFailedLoginAttempts = async function () {
  if (!this.failedLoginAttempts && !this.lockUntil) return
  this.failedLoginAttempts = 0
  this.lockUntil = null
  await this.save()
}

// limitAttempts is explicitly disabled so the schema's failedLoginAttempts/lockUntil counter is the
// single source of truth. The plugin's built-in attempts tracking is intentionally not used.
accountSchema.plugin(passportLocalMongoose, { usernameField: 'email', limitAttempts: false })

module.exports = mongoose.model('Account', accountSchema)
