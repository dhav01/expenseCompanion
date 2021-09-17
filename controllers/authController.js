const User = require('../models/userModel')
const jwt = require('jsonwebtoken')
const appError = require('../utils/appError')
const catchAsync = require('../utils/catchAsync')
const sendEmail = require('../utils/email')
const crypto = require('crypto')

const generateToken = (id) =>
  jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES,
  })

const createAndSendToken = (user, statusCode, res) => {
  const token = generateToken(user._id)
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
    ), //converting JWT_COOKIE_EXPIRES to milliseconds

    httpOnly: true, //to prevent XSS
  }
  //sending token in cookie
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true //only uses https so disable when in dev
  res.cookie('jwt', token, cookieOptions)

  user.password = undefined //to hide password when creating new user

  res.status(statusCode).json({
    status: 'success',
    token,
    user: user,
  })
}

exports.signup = catchAsync(async (req, res, next) => {
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    isAdmin: false,
  })
  createAndSendToken(user, 201, res)
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

  createAndSendToken(user, 200, res)
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
  req.user = user //passing the current user to next middleware
  next()
})

exports.isAdmin = (req, res, next) => {
  if (!req.user.isAdmin) {
    next(new appError('User not permitted to perform this action', 403))
  }
  next()
}

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //getting user from POST Email
  const user = await User.findOne({ email: req.body.email })
  if (!user) {
    next(new appError('Email address not found', 404))
  }

  //generating random token
  const passwordToken = user.generatePasswordResetToken()

  //we modified passwordResetToken and expiration time which we need to save to DB
  await user.save({ validateBeforeSave: false }) //to turn off all the validators as user is only going to provide email address

  //sending the token to user via email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${passwordToken}`
  const message = `Forgot your password? send a PATCH request to ${resetURL} with new password and confirmPassword to reset your password.
  If you didnt forget your password, please ignore this email.`

  //if send email fails, we want to set back passwordReset token as well as expiredToken time in DB so using try catch
  try {
    await sendEmail({
      email: user.email, //or even user.email its same
      subject: 'Password Reset Email',
      message,
    })

    res.status(200).json({
      status: 'success',
      message: 'password reset token sent successfully',
    })
  } catch (error) {
    user.passwordResetToken = undefined
    user.passwordTokenExpires = undefined
    console.log('Error occurred while sending email', error)
    await user.save({ validateBeforeSave: false })

    next(new appError('Something went wrong while sending email', 500))
  }
})

exports.resetPassword = catchAsync(async (req, res, next) => {
  //get user based on the token and also checking if token is not expired
  const encryptedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex')

  const user = await User.findOne({
    passwordResetToken: encryptedToken,
    passwordTokenExpires: { $gt: Date.now() },
  })
  if (!user) {
    next(new appError('Token is invalid or expired. Please try later.', 400))
  }
  //set new password if token not expired and there is user
  user.password = req.body.password
  user.confirmPassword = req.body.confirmPassword

  user.passwordResetToken = undefined
  user.passwordTokenExpires = undefined

  await user.save() //not turning off validators to validate password

  //update changedPasswordAt() prop of user (using pre 'save' middleware)

  //log the user in, send JWT
  createAndSendToken(user, 200, res)
})

exports.updatePassword = catchAsync(async (req, res, next) => {
  //get the user from collection
  const user = await User.findById(req.user.id).select('+password') //in isLogged middleware, we pass user through req.user
  //check if the POST password is correct
  console.log('body:', req.body)

  if (!(await user.checkPassword(req.body.currentPassword, user.password))) {
    return next(new appError('Incorrect old password. Please try again', 400))
  }

  //if yes, update password
  user.password = req.body.password
  user.confirmPassword = req.body.confirmPassword

  await user.save() //pre save middleware will handle remaining validation //findOneAndUpdate will not work because pre save middleware will not execute
  console.log('password update successful')
  //log the user in, send JWT
  createAndSendToken(user, 200, res)
})
