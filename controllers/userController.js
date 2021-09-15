const User = require('../models/userModel')

exports.createUser = async (req, res, next) => {
  try {
    const user = await User.create(req.body)
    res.status(200).json({
      status: 'success',
      user: user,
    })
  } catch (err) {
    res.status(400).json({
      status: 'error',
      error: err.message,
    })
  }
}

exports.getUsers = async (req, res, next) => {
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
}
