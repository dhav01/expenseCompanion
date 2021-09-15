const express = require('express')
const expenseController = require('../controllers/expenseController')

const router = express.Router()

router
  .route('/')
  .get(expenseController.getExpenses)
  .post(expenseController.createExpenses)

router
  .route('/:id')
  .patch(expenseController.updateExpense)
  .delete(expenseController.deleteExpense)
  .get(expenseController.getExpense)

module.exports = router
