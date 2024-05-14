const pool = require('../../db/mysql-db');
const logger = require('../util/logger');

let controller = {
    participateNewUser: (req, res, next) => {
      const mealId = req.params.mealId;
      const userId = req.user.userId; 
  
      pool.query('SELECT * FROM meal WHERE id = ?', [mealId], (err, results) => {
        if (err) {
          console.error('Error checking meal:', err);
          return res.status(500).json({ status: 500, message: 'Internal server error' });
        }
        if (results.length === 0) {
          return res.status(404).json({ status: 404, message: 'Meal not found' });
        }
        
        const meal = results[0];

        pool.query('SELECT COUNT(*) AS participantCount FROM meal_participants_user WHERE mealId = ?', [mealId], (err, countResults) => {
          if (err) {
            console.error('Error counting participants:', err);
            return res.status(500).json({ status: 500, message: 'Internal server error' });
          }
          if (countResults[0].participantCount >= meal.maxAmountOfParticipants) {
            return res.status(400).json({ status: 400, message: 'Maximum number of participants reached' });
          }
  
          pool.query('SELECT * FROM meal_participants_user WHERE mealId = ? AND userId = ?', [mealId, userId], (err, participantResults) => {
            if (err) {
              console.error('Error checking participant:', err);
              return res.status(500).json({ status: 500, message: 'Internal server error' });
            }
            if (participantResults.length > 0) {
              return res.status(409).json({ status: 409, message: 'User already registered for this meal' });
            }
  
            pool.query('INSERT INTO meal_participants_user (mealId, userId) VALUES (?, ?)', [mealId, userId], (err, insertResult) => {
              if (err) {
                console.error('Error adding participant:', err);
                return res.status(500).json({ status: 500, message: 'Internal server error' });
              }
              res.status(200).json({
                status: 200,
                message: `User with ID ${userId} is registered for meal with ID ${mealId}`
              });
            });
          });
        });
      });
    },
    deleteParticipate: (req, res, next) => {
        const mealId = req.params.mealId;
        const userId = req.user.userId;

        pool.query('SELECT * FROM meal WHERE id = ?', [mealId], (err, results) => {
            if (err) {
                console.error('Error checking meal:', err);
                return res.status(500).json({ status: 500, message: 'Internal server error' });
            }
            if (results.length === 0) {
                return res.status(404).json({ status: 404, message: 'Meal not found' });
            }

            pool.query('SELECT * FROM meal_participants_user WHERE mealId = ? AND userId = ?', [mealId, userId], (err, participantResults) => {
                if (err) {
                    console.error('Error checking participant:', err);
                    return res.status(500).json({ status: 500, message: 'Internal server error' });
                }
                if (participantResults.length === 0) {
                    logger.warn('User not registered for this meal', { userId, mealId });
                    return res.status(404).json({ status: 404, message: 'User not registered for this meal' });
                }

                pool.query('DELETE FROM meal_participants_user WHERE mealId = ? AND userId = ?', [mealId, userId], (err, deleteResult) => {
                    if (err) {
                        console.error('Error removing participant:', err);
                        return res.status(500).json({ status: 500, message: 'Internal server error' });
                    }
                    res.status(200).json({
                        status: 200,
                        message: `User with ID ${userId} has been successfully unregistered from meal with ID ${mealId}`
                    });
                });
            });
        });
    }
};
  
  module.exports = controller;
  