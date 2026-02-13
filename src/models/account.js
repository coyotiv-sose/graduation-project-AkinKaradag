const mongoose = require('mongoose')

const accountSchema = new mongoose.Schema({
    email: { type: String, require: true, lowercase: true },
    password: { type: String, require: true, minLength: 8 },
    role: { type: String, enum: ['customer', 'employee'], required: true },
})

module.exports = mongoose.model('Account', accountSchema)