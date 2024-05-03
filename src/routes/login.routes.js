const express = require('express')
const router = express.Router()
const loginController = require('../controllers/login.controller')
const { authenticateToken } = require('../middleware/auth'); 
const database = require('../../db/database');
router.use(express.json());

router.get('/api/user', authenticateToken, loginController.getAllUsers)

router.post('/api/user',loginController.validateUser, loginController.registerUser)
router.post('/api/login', loginController.loginUser)

router.delete('/api/user/:id',authenticateToken, loginController.deleteUser)

router.put('/api/user/:id', authenticateToken, loginController.updateUser);

router.get('/api/info', authenticateToken, (req, res, next) => {
    const userId = req.user.userId;  
    database.getById(userId, (err, user) => {
        if (err || !user) {
            const error={
                status:404,
                message: 'User not found'
            }
            next(error)
        }
        res.json({
            Id: user.id, 
            Name: user.firstName + " " + user.lastName,   
            description: "This is your account"
        });
    });
});

  module.exports = router