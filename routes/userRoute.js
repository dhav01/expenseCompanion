const express = require('express')
const userController = require('../controllers/userController')
const authController = require('../controllers/authController')

const router = express.Router()

router.route('/register').post(authController.createUser)
router.route('/login').post(authController.loginUser)

router.route('/').get(authController.isUserLogged, userController.getUsers)

router
  .route('/:id')
  .delete(
    authController.isUserLogged,
    authController.isAdmin,
    userController.deleteUser
  )

module.exports = router
