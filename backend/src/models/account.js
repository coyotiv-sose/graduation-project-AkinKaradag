const mongoose = require('mongoose')
const passportLocalMongoose = require('passport-local-mongoose')

const accountSchema = new mongoose.Schema({
    email: { type: String, required: true, lowercase: true },
    role: { type: String, enum: ['customer', 'employee'], required: true },
})

accountSchema.plugin(passportLocalMongoose, { usernameField: 'email' })

module.exports = mongoose.model('Account', accountSchema)