#!/usr/bin/env node

const path = require('path')
const mongoose = require('mongoose')

require('dotenv').config({
  path: path.resolve(__dirname, '../../secrets/admin.env'),
})

const Account = require('../src/models/account')

const DEFAULT_MONGODB_URI = 'mongodb://localhost:27017/karalog'

async function seedAdmin() {
  const email = process.env.SEED_ADMIN_EMAIL
  const password = process.env.SEED_ADMIN_PASSWORD
  const mongoUri = process.env.SEED_MONGODB_URI || DEFAULT_MONGODB_URI

  if (!email || !password) {
    console.error('Missing credentials. Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD in secrets/admin.env.')
    process.exit(1)
  }

  await mongoose.connect(mongoUri)
  console.log(`Connected to ${mongoUri}`)

  const existing = await Account.findOne({ email: email.toLowerCase() })
  if (existing) {
    console.log(`Admin account already exists: ${existing.email}`)
    await mongoose.disconnect()
    return
  }

  const account = await Account.register(new Account({ email, role: 'admin' }), password)
  console.log(`Admin account created: ${account.email} (role: ${account.role})`)

  await mongoose.disconnect()
}

seedAdmin().catch(async err => {
  console.error('Seed failed:', err.message)
  await mongoose.disconnect().catch(() => {})
  process.exit(1)
})
