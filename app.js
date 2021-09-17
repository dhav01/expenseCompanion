const express = require('express')
const expenseRouter = require('./routes/expenseRoute')
const userRouter = require('./routes/userRoute')
const connectDB = require('./config/db')
const appError = require('./utils/appError')
const errorController = require('./controllers/errorController')
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')

const app = express()
const port = 3000

//global middleware
//to set secure http headers
app.use(helmet()) //we need function call in app.use, not a func

app.use(express.json({ limit: '10kb' })) //limiting the amount of data req.body will accept to 10kb

//rate limiter middleware
const limiter = rateLimit({
  max: 50,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please come back after 1 hour',
}) //allowing max 50 request from each ip every hour; if exceeded, show message

app.use('/api', limiter) // apply limiter when any API is hit

//expense router
app.use('/api/v1/expenses', expenseRouter)
//user router
app.use('/api/v1/users', userRouter)

app.all('*', (req, res, next) => {
  next(new appError(`${req.originalUrl} route not implemented yet`, 404))
})

//error handler
app.use(errorController)

app.listen(port, () => {
  console.log('Server started successfully!')
})
connectDB()

app.post('/', (req, res) => {
  console.log(req.body.name, req.body.country)
  if (err.name === 'JsonWebTokenError') {
    console.log('JsonWebTokenError')
  }
  res.status(200).json({
    status: 'success',
    message: 'Congrats as you created your first API',
    data: req.body,
  })
})
