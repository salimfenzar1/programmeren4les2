const express = require('express')
const router = express.Router()
const loginController = require('../controllers/login.controller')
const { authenticateToken } = require('../middleware/auth'); 
const database = require('../../db/database');
router.use(express.json());

router.post('/api/user',loginController.validateUser, loginController.registerUser)
router.post('/api/login', loginController.loginUser)

router.get('/api/info', authenticateToken, (req, res) => {
    const userId = req.user.userId;  
    database.getById(userId, (err, user) => {
        if (err || !user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json({
            studentName: user.firstName + " " + user.lastName,
            studentNumber: user.id, 
            description: "Informatie over de ingelogde student"
        });
    });
});

  module.exports = router