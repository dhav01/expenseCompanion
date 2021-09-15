const User = require('../models/userModel')
const jwt = require('jsonwebtoken')

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
    res.status(400).json({
      status: 'fail',
      error: err.message,
    })
  }
}
