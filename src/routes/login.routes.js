const express = require('express')
const router = express.Router()
const loginController = require('../controllers/login.controller')
const { authenticateToken } = require('../middleware/auth'); 
const database = require('../../db/database');
router.use(express.json());

router.post('/api/user',loginController.validateUser, loginController.registerUser)
router.post('/api/login', loginController.loginUser)

router.delete('/api/user/:id', loginController.deleteUser)

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
            studentName: user.firstName + " " + user.lastName,
            studentNumber: user.id, 
            description: "Informatie over de ingelogde student"
        });
    });
});

  module.exports = router