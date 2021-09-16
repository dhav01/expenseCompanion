const express = require('express')
const expenseRouter = require('./routes/expenseRoute')
const userRouter = require('./routes/userRoute')
const connectDB = require('./config/db')
const appError = require('./utils/appError')
const errorController = require('./controllers/errorController')

const app = express()
const port = 3000

app.use(express.json())

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
