const express = require('express')
const router = express.Router()
const mealController = require('../controllers/meal.controller')
const { authenticateToken } = require('../middleware/auth'); 

router.use(express.json());

router.post('/api/meal', authenticateToken, mealController.addMeal);

router.get('/api/meal', mealController.getAllMeals);

router.get('/api/meal/:id', mealController.getMealById);

router.put('/api/meal/:id', authenticateToken, mealController.updateMeal);

router.delete('/api/meal/:id',authenticateToken, mealController.deleteMeal)

module.exports = router