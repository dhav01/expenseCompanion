const User = require('../models/userModel')

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
