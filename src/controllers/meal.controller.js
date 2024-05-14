const pool = require('../../db/mysql-db');

let controller = {
  addMeal: (req, res, next) => {
    const {
        isActive,
        isVega = 0,   
        isVegan = 0,  
        isToTakeHome = 0,
        dateTime,
        maxAmountOfParticipants,
        price,
        imageUrl,
        name,
        description,
        allergenes = ''
      } = req.body;
    
      const cookId = req.user.userId; 
    

    const missingFields = [];
    if (!isActive) missingFields.push('isActive');
    if (!name) missingFields.push('name');
    if (!description) missingFields.push('description');
    if (!imageUrl) missingFields.push('imageUrl');
    if (!dateTime) missingFields.push('dateTime');
    if (!maxAmountOfParticipants) missingFields.push('maxAmountOfParticipants');
    if (!price) missingFields.push('price');

    if (missingFields.length > 0) {
      return res.status(400).json({
        status: 400,
        message: `Missing required fields: ${missingFields.join(', ')}`,
        data: {}
      });
    }
    
      pool.query(
        'INSERT INTO meal (isActive, isVega, isVegan, isToTakeHome, dateTime, maxAmountOfParticipants, price, imageUrl, cookId, name, description, allergenes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [isActive, isVega, isVegan, isToTakeHome, dateTime, maxAmountOfParticipants, price, imageUrl, cookId, name, description, allergenes],
        (err, result) => {
          if (err) {
            console.error('Error inserting meal:', err);
            return res.status(500).json({ status: 500, message: 'Internal server error' });
          }

          res.status(201).json({
            status:201,
            message: 'Meal added successfully',
            data: {
              id: result.insertId,
              isActive,
              isVega,
              isVegan,
              isToTakeHome,
              dateTime,
              maxAmountOfParticipants,
              price,
              imageUrl,
              cookId,
              name,
              description,
              allergenes
          }
        });
      }
    );
  },
  deleteMeal: (req, res, next) => {
    const { id } = req.params;
    const userId = req.user.userId; 
  
    pool.query('SELECT * FROM meal WHERE id = ?', [id], (err, results) => {
      if (err || results.length === 0) {
        return res.status(404).json({ status: 404, message: 'Meal not found' });
      }
  
      const meal = results[0];

      if (meal.cookId !== userId) {
        return res.status(403).json({ status: 403, message: 'Unauthorized to delete this meal' });
      }
  
      pool.query('DELETE FROM meal WHERE id = ?', [id], (err) => {
        if (err) {
          console.error('Error deleting meals:', err);
          return res.status(500).json({ status: 500, message: 'Internal server error' });
        }
  
        return res.status(200).json({ status: 200, message: `Meal deleted successfully with id:${id}` });
      });
    });
  },
  getAllMeals: (req, res, next) => {
    pool.query('SELECT * FROM meal', (err, results) => {
      if (err) {
        console.log('Error retrieving meals:', err);
        return res.status(500).json({
          status: 500,
          message: 'Internal server error while fetching meals'
        });
      }

      res.status(200).json({
        status: 200,
        message: 'Meals retrieved successfully',
        data: results
      });
    });
  },
  getMealById: (req, res, next) => {
    const { id } = req.params; 
  
    pool.query('SELECT * FROM meal WHERE id = ?', [id], (err, results) => {
      if (err || results.length === 0) {
        return res.status(404).json({
          status: 404,
          message: 'Meal not found'
        });
      }

      res.status(200).json({
        status: 200,
        message: 'Meal retrieved successfully',
        data: results
      });
    })
  },
  updateMeal: (req, res, next) => {
    const { id } = req.params;
    const {
      isActive,
      isVega,
      isVegan,
      isToTakeHome,
      dateTime,
      maxAmountOfParticipants,
      price,
      imageUrl,
      name,
      description,
      allergenes
    } = req.body;
  
    const missingFields = [];
    if (name === undefined) missingFields.push('name');
    if (price === undefined) missingFields.push('price');
    if (maxAmountOfParticipants === undefined) missingFields.push('maxAmountOfParticipants');
  
    if (missingFields.length > 0) {
      return res.status(400).json({
        status: 400,
        message: `Missing required update fields: ${missingFields.join(', ')}`
      });
    }
  
    const fieldsToUpdate = [isActive, isVega, isVegan, isToTakeHome, dateTime, maxAmountOfParticipants, price, imageUrl, name, description, allergenes];
    const hasUpdate = fieldsToUpdate.some(field => field !== undefined);
  
    if (!hasUpdate) {
      return res.status(400).json({
        status: 400,
        message: 'No fields provided for update'
      });
    }
  
    const userId = req.user.userId;
  
    pool.query('SELECT * FROM meal WHERE id = ?', [id], (err, results) => {
      if (err || results.length === 0) {
        return res.status(404).json({
          status: 404,
          message: 'Meal not found'
        });
      }
  
      const meal = results[0];
  
      if (meal.cookId !== userId) {
        return res.status(403).json({ status: 403, message: 'Unauthorized to update this meal' });
      }
  
      const updatedMeal = {
        isActive: isActive !== undefined ? isActive : meal.isActive,
        isVega: isVega !== undefined ? isVega : meal.isVega,
        isVegan: isVegan !== undefined ? isVegan : meal.isVegan,
        isToTakeHome: isToTakeHome !== undefined ? isToTakeHome : meal.isToTakeHome,
        dateTime: dateTime !== undefined ? dateTime : meal.dateTime,
        maxAmountOfParticipants: maxAmountOfParticipants !== undefined ? maxAmountOfParticipants : meal.maxAmountOfParticipants,
        price: price !== undefined ? price : meal.price,
        imageUrl: imageUrl !== undefined ? imageUrl : meal.imageUrl,
        name: name !== undefined ? name : meal.name,
        description: description !== undefined ? description : meal.description,
        allergenes: allergenes !== undefined ? allergenes : meal.allergenes
      };
  
      pool.query(
        'UPDATE meal SET isActive = ?, isVega = ?, isVegan = ?, isToTakeHome = ?, dateTime = ?, maxAmountOfParticipants = ?, price = ?, imageUrl = ?, name = ?, description = ?, allergenes = ? WHERE id = ?',
        [updatedMeal.isActive, updatedMeal.isVega, updatedMeal.isVegan, updatedMeal.isToTakeHome, updatedMeal.dateTime, updatedMeal.maxAmountOfParticipants, updatedMeal.price, updatedMeal.imageUrl, updatedMeal.name, updatedMeal.description, updatedMeal.allergenes, id],
        (err) => {
          if (err) {
            return res.status(400).json({ status: 400, message: err });
          }
  
          res.status(200).json({status:200, message: 'Meal updated successfully', data: updatedMeal });
        }
      );
    });
  }
}

module.exports = controller;