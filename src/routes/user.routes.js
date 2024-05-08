const express = require('express')
const router = express.Router()
const userController = require('../controllers/user.controller')
const { authenticateToken } = require('../middleware/auth'); 

router.use(express.json());

router.get('/api/profile', authenticateToken, userController.getUserProfile);

router.get('/api/user', authenticateToken, userController.getAllUsers)

router.post('/api/user', userController.validateUser, userController.registerUser)

router.post('/api/login', userController.loginUser)

router.delete('/api/user/:id',authenticateToken, userController.deleteUser)

router.put('/api/user/:id', authenticateToken, userController.updateUser);

router.get('/api/user/:id', authenticateToken, userController.getUserById)



module.exports = router