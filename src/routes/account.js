var express = require('express')
var router = express.Router()
var Account = require('./account')

/* GET account list */
router.get('/', function(req, res, next) {
    res.send([
        { id: 1, email: 'someEmail1@mail.com' },
        { id: 2, email: 'someEmail2@mail.com' },
        { id: 3, email: 'someEmail3@mail.com' },
    ])
})

/* Create a new Account */
router.post('/', function(req, res, next) {
    const account = new Account(req.body.id, req.body.email)
    res.send(account)
})