const createError = require('http-errors')
const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const cors = require('cors')
const session = require('express-session')
const passport = require('passport')

require('dotenv').config()
require('./database-connection')

const Account = require('./models/account')
const MongoStore = require('connect-mongo').default
const mongoose = require('mongoose')

const clientPromise = mongoose.connection.asPromise().then(connection => (connection = connection.getClient()))

passport.use(Account.createStrategy())
passport.serializeUser(Account.serializeUser())
passport.deserializeUser(Account.deserializeUser())

const indexRouter = require('./routes/index')
const customersRouter = require('./routes/customers')
const companyRouter = require('./routes/companies')
const ordersRouter = require('./routes/orders')
const vehiclesRouter = require('./routes/vehicles')
const toursRouter = require('./routes/tours')
const employeesRouter = require('./routes/employees')
const accountsRouter = require('./routes/accounts')

const app = express()

const allowedOrigins = process.env.FRONENTEND_URL
    ? process.env.FRONENTEND_URL.split(',')
    : []

app.use(
    cors({
        origin: allowedOrigins,
        credentials: true,
    })
)

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))
app.use(
    session({
        secret: process.env.SESSION_SECRET || 'adaw35345tfgs4wsgsA+_3sada',
        resave: false,
        saveUninitialized: true,
        cookie: {
            maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days
            secure: process.env.NODE_ENV === 'production',
        },
        store: MongoStore.create({ clientPromise, stringify: false }),
    })
)
app.use(passport.initialize())
app.use(passport.session())
app.use((req, res, next) => {
    const numberOfVisits = req.session.numberOfVisits || 0
    req.session.numberOfVisits = numberOfVisits + 1
    req.session.history = req.session.history || []
    req.session.history.push({ url: req.url, ip: req.ip })

    next()
})

app.use('/', indexRouter)
app.use('/customers', customersRouter)
app.use('/companies', companyRouter)
app.use('/orders', ordersRouter)
app.use('/vehicles', vehiclesRouter)
app.use('/tours', toursRouter)
app.use('/employees', employeesRouter)
app.use('/accounts', accountsRouter)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404))
})

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message
    res.locals.error = req.app.get('env') === 'development' ? err : {}

    // render the error page
    res.status(err.status || 500)
    res.render('error')
})

module.exports = app