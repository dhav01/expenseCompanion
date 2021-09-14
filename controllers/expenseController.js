exports.getExpenses = (req, res, next) => {
  res.status(200).json({
    status: 'success',
    message: 'You hit GET all expenses route',
  })
}

exports.createExpenses = (req, res, next) => {
  res.status(200).json({
    status: 'success',
    message: 'You hit POST create expenses route',
  })
}

exports.getExpense = (req, res, next) => {
  console.log(req.params.id)
  res.status(200).json({
    status: 'success',
    message: `You hit POST get expense route with id ${req.params.id}`,
  })
}
