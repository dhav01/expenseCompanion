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

exports.getCurrentUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id)
  if (!user) {
    next(new appError('User not found', 404))
  }

  res.status(200).json({
    status: 'success',
    user,
  })
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

exports.updateCurrentUser = catchAsync(async (req, res, next) => {
  //throw error if user POST password
  if (req.body.password || req.body.confirmPassword) {
    next(
      new appError('Please use /updatePassword to update your password', 400)
    )
  }

  //update user doc
  const user = await User.findById(req.user.id)
  const dataToSend = filterBodyObject(req.body, 'name', 'email')

  const updatedUser = await User.findByIdAndUpdate(user, dataToSend, {
    new: true,
    runValidators: true,
  }) //using these to avoid middleware
  // {new:true,runValidators : true} to get the updated user data and run validators of schema except confirm password

  res.status(200).json({
    status: 'success',
    data: updatedUser,
  })
})

//remove not permitted fields from the req.body like role, password ,etc
const filterBodyObject = (obj, ...allowedFields) => {
  //...fields will contain array of all the args passed to func
  let dataToSend = {}
  Object.keys(obj).forEach((el) => {
    if (el.includes(allowedFields)) {
      dataToSend[allowedFields] = obj[el]
    }
  })
  return dataToSend
}

exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id)
  console.log('User info: ', user)
  if (!user) {
    return next(new appError('User not found', 404))
  }

  res.status(200).json({
    status: 'success',
    message: user,
  })
})

exports.deleteCurrentUser = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false })

  res.status(204).json({
    status: 'success',
    data: null,
  })
})
