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
    },
    getParticipants: (req, res, next) => {
        const mealId = req.params.mealId;
        const userId = req.user.userId; 
    
        pool.query('SELECT cookId FROM meal WHERE id = ?', [mealId], (err, mealResults) => {
            if (err) {
                console.error('Error fetching meal:', err);
                return res.status(500).json({ status: 500, message: 'Internal server error' });
            }
            if (mealResults.length === 0) {
                return res.status(404).json({ status: 404, message: 'Meal not found' });
            }
            if (mealResults[0].cookId !== userId) {
                return res.status(403).json({ status: 403, message: 'Unauthorized to view participants' });
            }
    
            pool.query('SELECT user.id, user.firstName, user.lastName, user.emailAdress, user.street, user.city FROM meal_participants_user JOIN user ON meal_participants_user.userId = user.id WHERE meal_participants_user.mealId = ?', [mealId], (err, results) => {
                if (err) {
                    console.error('Error fetching participants:', err);
                    return res.status(500).json({ status: 500, message: 'Internal server error' });
                }
                if (results.length === 0) {
                    return res.status(404).json({ status: 404, message: 'No participants found for this meal' });
                }
                res.status(200).json({
                    status: 200,
                    data: results
                });
            });
        });
    },
    getParticipantsById: (req, res, next) => {
        const mealId = req.params.mealId;
        const participantId = req.params.participantId;
        const userId = req.user.userId; 
    
        pool.query('SELECT cookId FROM meal WHERE id = ?', [mealId], (err, mealResults) => {
            if (err) {
                console.error('Error fetching meal:', err);
                return res.status(500).json({ status: 500, message: 'Internal server error' });
            }
            if (mealResults.length === 0) {
                return res.status(404).json({ status: 404, message: 'Meal not found' });
            }
            if (mealResults[0].cookId !== userId) {
                return res.status(403).json({ status: 403, message: 'Unauthorized to view participant details' });
            }
    
            pool.query('SELECT user.id, user.firstName, user.lastName, user.emailAdress, user.street, user.city FROM meal_participants_user JOIN user ON meal_participants_user.userId = user.id WHERE meal_participants_user.mealId = ? AND user.id = ?', [mealId, participantId], (err, results) => {
                if (err) {
                    console.error('Error fetching participant details:', err);
                    return res.status(500).json({ status: 500, message: 'Internal server error' });
                }
                if (results.length === 0) {
                    return res.status(404).json({ status: 404, message: 'Participant not found for this meal' });
                }
                res.status(200).json({
                    status: 200,
                    data: results[0]
                });
            });
        });
    },
};
  
  module.exports = controller;
  