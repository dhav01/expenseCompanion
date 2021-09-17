const express = require('express')
const userController = require('../controllers/userController')
const authController = require('../controllers/authController')

const router = express.Router()

router.route('/register').post(authController.signup)
router.route('/login').post(authController.loginUser)
router.route('/forgotPassword').post(authController.forgotPassword)
router.route('/resetPassword/:token').patch(authController.resetPassword)
router
  .route('/updateCurrentUser')
  .patch(authController.isUserLogged, userController.updateCurrentUser)

router
  .route('/getUser')
  .get(authController.isUserLogged, userController.getCurrentUser)

router
  .route('/updatePassword')
  .patch(authController.isUserLogged, authController.updatePassword)
router.patch(
  '/updateUser',
  authController.isUserLogged,
  userController.updateCurrentUser
)

router.route('/').get(authController.isUserLogged, userController.getUsers)

router
  .route('/:id')
  .delete(
    authController.isUserLogged,
    authController.isAdmin,
    userController.deleteUser
  )
  .get(
    authController.isUserLogged,
    authController.isAdmin,
    userController.getUser
  )

module.exports = router
