const User = require('../models/userModel')
const appError = require('../utils/appError')
const catchAsync = require('../utils/catchAsync')

exports.getUsers = catchAsync(async (req, res, next) => {
  try {
    const users = await User.find()
    res.status(200).json({
      status: 'success',
      users: users.length,
      data: {
        users,
      },
    })
  } catch (err) {
    res.status(500).json({
      status: 'error',
      error: err,
    })
  }
})

exports.deleteUser = catchAsync(async (req, res, next) => {
  console.log('You are in deleteUser middleware', req.params.id)

  const user = await User.findOneAndDelete({ _id: req.params.id })
  if (!user) {
    return next(new appError(`User id: ${req.params.id} is invalid`, 400))
  }
  res.status(204).json({
    status: 'success',
    message: 'user deleted successfully',
  })
})
