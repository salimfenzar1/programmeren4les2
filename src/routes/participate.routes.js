const express = require('express')
const router = express.Router()
const participateController = require('../controllers/participate.controller')
const { authenticateToken } = require('../middleware/auth'); 

router.use(express.json());

router.post('/api/meal/:mealId/participate', authenticateToken, participateController.participateNewUser);
router.delete('/api/meal/:mealId/participate', authenticateToken, participateController.deleteParticipate);

router.get('/api/meal/:mealId/participants', authenticateToken, participateController.getParticipants);
router.get('/api/meal/:mealId/participants/:participantId', authenticateToken, participateController.getParticipantsById);


module.exports = router