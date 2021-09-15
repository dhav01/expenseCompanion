const mongoose = require('mongoose')

const expenseSchema = mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please specify the expense title'],
  },
  amount: {
    type: Number,
    required: [true, 'Please specify the expense amount'],
  },
  incurredOn: Date,
})

const Expense = mongoose.model('Expenses', expenseSchema)

module.exports = Expense
