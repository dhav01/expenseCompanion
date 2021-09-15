const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please enter you name'],
  },
  email: {
    type: String,
    required: [true, 'Please enter email to proceed'],
    unique: true,
  },
  password: {
    type: String,
    required: [true, 'Please enter password to proceed'],
  },
  confirmPassword: {
    type: String,
    required: [true, 'Please confirm the password to create the user'],
    validate: {
      validator: function (el) {
        return el === this.password
      },
      message: 'password and confirm password do not match',
    },
  },
})

const User = mongoose.model('User', userSchema)

module.exports = User
