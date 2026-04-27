/* eslint-disable import/order */
/* eslint-disable no-param-reassign */
/* eslint-disable no-return-assign */
/* eslint-disable global-require */
const createError = require('http-errors')
const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const cors = require('cors')
const session = require('express-session')
const passport = require('passport')
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize')
const { errors: celebrateErrors } = require('celebrate')

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
const adminRouter = require('./routes/admin')
const apiErrorHandler = require('./middlewares/api-error-handler')
const markApi = require('./middlewares/mark-api')

const app = express()

if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1)
}

const allowedOrigins = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',').map(origin => origin.trim()) : []

const corsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true)
    if (!allowedOrigins.length) return callback(null, true)
    if (allowedOrigins.includes(origin)) return callback(null, true)
    return callback(new Error('Not allowed by CORS'))
  },
  credentials: true,
}

app.use(cors(corsOptions))

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

if (process.env.NODE_ENV !== 'test') {
  app.use(logger('dev'))
}
app.use(helmet())
app.use(mongoSanitize())
app.use(express.json({ limit: '10kb' }))
app.use(express.urlencoded({ extended: false, limit: '10kb' }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))
const sessionMiddleware = session({
  name: 'sid',
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  unset: 'destroy',
  cookie: {
    httpOnly: true,
    maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    secure: process.env.NODE_ENV === 'production',
  },
  store: MongoStore.create({ clientPromise, stringify: false }),
})

app.use(sessionMiddleware)
app.use(passport.initialize())
app.use(passport.session())

app.use('/', indexRouter)
app.use('/customers', markApi, customersRouter)
app.use('/companies', markApi, companyRouter)
app.use('/orders', markApi, ordersRouter)
app.use('/vehicles', markApi, vehiclesRouter)
app.use('/tours', markApi, toursRouter)
app.use('/employees', markApi, employeesRouter)
app.use('/accounts', markApi, accountsRouter)
app.use('/admin', markApi, adminRouter)
app.use(celebrateErrors())

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404))
})

app.use(apiErrorHandler)

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error')
})

app.createSocketServer = function (server) {
  const customerManager = require('./managers/customer-manager')
  const employeeManager = require('./managers/employee-manager')

  const io = require('socket.io')(server, {
    cors: {
      origin: true,
      credentials: true,
    },
  })

  app.io = io

  io.engine.use(sessionMiddleware)
  io.engine.use(passport.initialize())
  io.engine.use(passport.session())

  io.on('connection', async socket => {
    const account = socket.request.user
    console.log('A account connected:', socket.id, account?._id?.toString())

    if (account) {
      try {
        if (account.role === 'customer') {
          const customer = await customerManager.getCustomerByAccountId(account._id)
          socket.join(`customer:${customer._id.toString()}`)
        } else if (account.role === 'employee') {
          const employee = await employeeManager.getEmployeeByAccountId(account._id)
          socket.join(`company:${employee.company.toString()}`)
        }
      } catch (error) {
        console.error('Failed to auto-join rooms for account:', account._id, error.message)
      }
    }

    socket.on('join:order', orderId => {
      socket.join(`order:${orderId}`)
    })

    socket.on('leave:order', orderId => {
      socket.leave(`order:${orderId}`)
    })

    socket.on('disconnect', () => {
      console.log('A account disconnected:', socket.id)
    })
  })
}
module.exports = app
