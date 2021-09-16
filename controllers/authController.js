const User = require('../models/userModel')
const jwt = require('jsonwebtoken')
const appError = require('../utils/appError')
const catchAsync = require('../utils/catchAsync')

const generateToken = (id) =>
  jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES,
  })

exports.createUser = catchAsync(async (req, res, next) => {
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    isAdmin: false,
  })

  const token = generateToken(user._id)

  res.status(200).json({
    status: 'success',
    token,
    user: user,
  })
})

exports.loginUser = catchAsync(async (req, res, next) => {
  const { email, password } = req.body

  //checking email and password are provided
  if (!email || !password) {
    next(new appError('Please enter valid email and password', 401))
  }

  //check user exist and password entered by user
  const user = await User.findOne({ email: email }).select('+password') // as we hide the password in model
  // console.log(user)

  if (!user || !(await user.checkPassword(password, user.password))) {
    next(new appError('Incorrect Email or Password. Please retry again.', 401))
  }

  const token = generateToken(user._id)
  res.status(200).json({
    status: 'success',
    token: token,
  })
})

exports.isUserLogged = catchAsync(async (req, res, next) => {
  //getting token and checking if its there token: Bearer <token>
  let token
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1]
  }
  if (!token) {
    next(new appError('Please Login first to continue.', 401))
  }
  //token verification
  const decode = await jwt.verify(token, process.env.JWT_SECRET)
  console.log(decode)
  //check if the user still exist in db
  const user = await User.findById(decode.id)
  if (!user) {
    next(new appError('User not found. Please sign up again', 401))
  }
  //check if password was updated after token was issued
  if (user.resetPassAfterToken(decode.iat)) {
    next(
      new appError(
        'password was changed after token was issued. Please log in again.',
        401
      )
    )
  }
  //grant access to protected routes
  next()
})
