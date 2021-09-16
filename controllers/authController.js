const User = require('../models/userModel')
const jwt = require('jsonwebtoken')
const errorController = require('./errorController')

const generateToken = (id) =>
  jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES,
  })

exports.createUser = async (req, res, next) => {
  try {
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
  } catch (err) {
    res.status(400).json({
      status: 'error',
      error: err.message,
    })
  }
}

exports.loginUser = async (req, res, next) => {
  const { email, password } = req.body

  try {
    //checking email and password are provided
    if (!email || !password) {
      throw new Error('Please enter valid email and password')
    }

    //check user exist and password entered by user
    const user = await User.findOne({ email: email }).select('+password') // as we hide the password in model
    // console.log(user)

    if (!user || !(await user.checkPassword(password, user.password))) {
      throw new Error('Incorrect Email or Password. Please retry again.')
    }

    const token = generateToken(user._id)
    res.status(200).json({
      status: 'success',
      token: token,
    })
  } catch (err) {
    next(err)
  }
}

exports.isUserLogged = async (req, res, next) => {
  try {
    //getting token and checking if its there token: Bearer <token>
    let token
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1]
    }
    if (!token) {
      next(new errorController('Please Login first to continue.', 401))
    }
    //token verification
    const decode = await jwt.verify(token, process.env.JWT_SECRET)

    //check if the user still exist in db
    const user = await User.findById(decoded.id)
    //check if password was updated after token was issued
  } catch (err) {
    if (err.message === 'jwt must be provided') {
      err.status = 401
      err.message = 'Auth token not found. Please try later.'
    }
    if (err.message === 'jwt malformed') {
      err.status = 401
    }
    next(err)
  }
}
