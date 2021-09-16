const appError = require('../utils/appError')

const handleJWTError = () => new appError('Invalid token. Please Log in Again.')

const handleCastError = (err) => {
  const message = `Please provide valid id: ${err.value}`
  return new appError(message, 400)
}

const handleTokenExpiredError = () =>
  new appError('Auth token expired. Please Login again.')

const handleDuplicateFieldError = (err) => {
  return new appError(
    `User with ${err.keyValue.email} already exists. Please login`,
    400
  )
}

module.exports = (err, req, res, next) => {
  if (err.name === 'CastError') err = handleCastError(err)
  if (err.name === 'JsonWebTokenError') err = handleJWTError()
  if (err.name === 'TokenExpiredError') err = handleTokenExpiredError()
  if (err.code === 11000) err = handleDuplicateFieldError(err)
  err.statusCode = err.statusCode || 500
  //   err.message = err.message || 'internal server error'
  //   console.log('Something went wrong', err)
  console.log('Error from errorController', err.stack)
  res.status(err.statusCode).json({
    status: 'error',
    message: err.message,
    error: err,
  })
}
