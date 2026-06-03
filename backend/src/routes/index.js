/* eslint-disable func-names */
/* eslint-disable no-unused-vars */
const express = require('express')

const router = express.Router()

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'RouteWerk' })
})

module.exports = router
