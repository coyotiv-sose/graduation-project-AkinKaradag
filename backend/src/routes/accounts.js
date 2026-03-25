const express = require('express')

const passport = require('passport')
const router = express.Router()
const Account = require('../models/account')

router.get('/session', async(req, res, next) => {
    res.send(req.session)
})

router.post('/', async(req, res, next) => {
    try {
        const { email, password, role } = req.body
        const account = await Account.register(new Account({ email, role }), password)
        res.json(account)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
})

router.post('/session', (req, res, next) => {
    passport.authenticate('local', (err, user) => {
        if (err) return res.status(500).json({ error: err.message })
        if (!user) return res.status(401).json({ error: 'Invalid email or password' })
        res.json(user)
    })(req, res, next)
})

module.exports = router
