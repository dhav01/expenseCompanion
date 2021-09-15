const Expense = require('../models/expenseModel')

exports.getExpenses = async (req, res, next) => {
  const expenses = await Expense.find()
  res.status(200).json({
    status: 'success',
    expenses: {
      expenses,
    },
  })
}

exports.createExpenses = async (req, res, next) => {
  try {
    req.body.incurredOn = new Date().toISOString()
    const expense = await Expense.create(req.body)

    res.status(200).json({
      status: 'success',
      expense: expense,
    })
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      error: error.message,
    })
  }
}

exports.getExpense = (req, res, next) => {
  console.log(req.params.id)
  res.status(200).json({
    status: 'success',
    message: `You hit POST get expense route with id ${req.params.id}`,
  })
}

exports.deleteExpense = (req, res, next) => {
  res.status(204).json({
    status: 'success',
    message: 'Expense deleted successfully',
  })
}

exports.updateExpense = (req, res, next) => {
  res.status(200).json({
    status: 'success',
    message: 'Expense update successfully',
  })
}
