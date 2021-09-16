const express = require('express')
const expenseRouter = require('./routes/expenseRoute')
const userRouter = require('./routes/userRoute')
const connectDB = require('./config/db')
const errorController = require('./controllers/errorController')

const app = express()
const port = 3000

app.use(express.json())

//expense router
app.use('/api/v1/expenses', expenseRouter)
//user router
app.use('/api/v1/users', userRouter)

app.all('*', (req, res, next) => {
  next(new errorController(`${req.originalUrl} route not implemented yet`, 404))
})

//error handler
app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500
  //   err.message = err.message || 'internal server error'
  //   console.log('Something went wrong', err)
  res.status(err.statusCode).json({
    status: 'error',
    error: err.message,
    stack: err.stack,
  })
})

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
