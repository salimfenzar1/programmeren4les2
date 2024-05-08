const express = require('express')
const router = express.Router()
const mealController = require('../controllers/meal.controller')
const { authenticateToken } = require('../middleware/auth'); 

router.use(express.json());

router.post('/api/meal', authenticateToken, mealController.addMeal);

router.get('/api/meal', authenticateToken, mealController.getAllMeals);

router.put('/api/meal/:id', authenticateToken, mealController.updateMeal);

// router.delete('/api/meal/:id',authenticateToken, userController.deleteUser)

module.exports = router