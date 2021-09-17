const crypto = require('crypto')
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
        //only run for create and save
        return el === this.password
      },
      message: 'password and confirm password do not match',
    },
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordTokenExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
})

//defining a middleware to encrypt user password in DB before saving it
userSchema.pre('save', async function (next) {
  //only encrypt user password when created/updated; dont want to do it for any other changes
  if (!this.isModified('password')) return next()

  //encrypting the passwords
  this.password = await bcrypt.hash(this.password, 12)

  //deleting the confirm password property; dont want it in DB
  this.confirmPassword = undefined
  next()
})

//query middleware to deactivate user account
userSchema.pre(/^find/, function (next) {
  //this middleware is executed before all the middleware when *find is fired
  this.find({ active: { $ne: false } })

  next()
})

userSchema.pre('save', async function (next) {
  //middleware to modify passwordChangedAt prop of user only when doc modified, not created
  if (!this.isModified() || this.isNew) {
    return next()
  }

  this.passwordChangedAt = Date.now() - 1000 //sometimes JWT is created before password is updated so setting change time 1sec less than actual
  next()
})

userSchema.methods.checkPassword = async function (password, originalPassword) {
  return await bcrypt.compare(password, originalPassword)
}

userSchema.methods.resetPassAfterToken = function (jwtTimeStamp) {
  if (this.passwordChangedAt) {
    const changedPasswordTime = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    )

    return jwtTimeStamp < changedPasswordTime // return true if password was changed after token was issued
  }
  return false
}

userSchema.methods.generatePasswordResetToken = function () {
  const randomToken = crypto.randomBytes(32).toString('hex')

  //encrypting the token and storing it in DB
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(randomToken)
    .digest('hex')

  console.log('generatedPassword:', { randomToken }, this.passwordResetToken) //{randomToken} will give randomToken: <value>

  this.passwordTokenExpires = Date.now() + 10 * 60 * 1000 //password reset token only valid for 10 minutes

  //sending the unencrypted token to user
  return randomToken
}

const User = mongoose.model('User', userSchema)

module.exports = User
