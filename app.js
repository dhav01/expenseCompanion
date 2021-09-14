const express = require('express')
const expenseRouter = require('./routes/expenseRoute')

const app = express()
const port = 3000

app.use(express.json())

//expense router
app.use('/api/v1/expenses', expenseRouter)

app.listen(port, () => {
  console.log('Server started successfully!')
})

app.post('/', (req, res) => {
  console.log(req.body.name, req.body.country)

  res.status(200).json({
    status: 'success',
    message: 'Congrats as you created your first API',
    data: req.body,
  })
})
