const User = require('../models/userModel')
const jwt = require('jsonwebtoken')

exports.createUser = async (req, res, next) => {
  try {
    const user = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      confirmPassword: req.body.confirmPassword,
      isAdmin: false,
    })

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES,
    })

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
