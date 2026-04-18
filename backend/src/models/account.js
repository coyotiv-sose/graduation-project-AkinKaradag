const mongoose = require('mongoose')
const { default: passportLocalMongoose } = require('passport-local-mongoose')

const accountSchema = new mongoose.Schema({
  email: { type: String, required: true, lowercase: true },
  role: { type: String, enum: ['customer', 'employee', 'admin'], required: true },
})

accountSchema.plugin(passportLocalMongoose, { usernameField: 'email' })

module.exports = mongoose.model('Account', accountSchema)
