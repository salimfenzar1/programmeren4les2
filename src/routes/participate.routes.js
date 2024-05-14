const express = require('express')
const router = express.Router()
const participateController = require('../controllers/participate.controller')
const { authenticateToken } = require('../middleware/auth'); 

router.use(express.json());

router.post('/api/meal/:mealId/participate', authenticateToken, participateController.participateNewUser);
router.delete('/api/meal/:mealId/participate', authenticateToken, participateController.deleteParticipate);


module.exports = router