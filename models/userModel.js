const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please enter you name'],
  },
  email: {
    type: String,
    required: [true, 'Please enter email to proceed'],
    unique: true,
    validate: [validator.isEmail, 'please enter valid email address'],
    lowercase: true,
  },
  password: {
    type: String,
    required: [true, 'Please enter password to proceed'],
    minLength: [6, 'please enter password with minimum 6 characters'],
    select: false,
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
  isAdmin: {
    type: Boolean,
    default: false,
  },
})

userSchema.pre('save', async function (next) {
  this.password = await bcrypt.hash(this.password, 12)
  this.confirmPassword = undefined

  next()
})

userSchema.methods.checkPassword = async function (password, originalPassword) {
  return await bcrypt.compare(password, originalPassword)
}

const User = mongoose.model('User', userSchema)

module.exports = User
