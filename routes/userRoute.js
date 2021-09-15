const express = require('express')
const userController = require('../controllers/userController')
const authController = require('../controllers/authController')

const router = express.Router()

router.route('/').get(userController.getUsers).post(authController.createUser)

module.exports = router
