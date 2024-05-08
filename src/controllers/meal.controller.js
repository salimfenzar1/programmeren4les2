const pool = require('../../db/mysql-db');

let controller = {
  addMeal: (req, res, next) => {
    // Haal de velden voor een nieuwe maaltijd op uit het request body
    const {
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
    } = req.body;

    // Valideer de benodigde velden
    const missingFields = [];
    if (typeof isActive === 'undefined') missingFields.push('isActive');
    if (typeof isVega === 'undefined') missingFields.push('isVega');
    if (typeof isVegan === 'undefined') missingFields.push('isVegan');
    if (typeof isToTakeHome === 'undefined') missingFields.push('isToTakeHome');
    if (!dateTime) missingFields.push('dateTime');
    if (!maxAmountOfParticipants) missingFields.push('maxAmountOfParticipants');
    if (!price) missingFields.push('price');
    if (!imageUrl) missingFields.push('imageUrl');
    if (!cookId) missingFields.push('cookId');
    if (!name) missingFields.push('name');
    if (!description) missingFields.push('description');
    if (!allergenes) missingFields.push('allergenes');

    if (missingFields.length > 0) {
      return res.status(400).json({
        status: 400,
        message: `Missing required fields: ${missingFields.join(', ')}`,
        data: {}
      });
    }

    // Voer de query uit om een nieuwe maaltijd toe te voegen
    pool.query(
      'INSERT INTO meal (isActive, isVega, isVegan, isToTakeHome, dateTime, maxAmountOfParticipants, price, imageUrl, cookId, name, description, allergenes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [isActive, isVega, isVegan, isToTakeHome, dateTime, maxAmountOfParticipants, price, imageUrl, cookId, name, description, allergenes],
      (err, result) => {
        if (err) {
          console.error('Error inserting meal:', err);
          return res.status(500).json({ status: 500, message: 'Internal server error' });
        }

        // Geef een succesmelding terug met de informatie van de nieuwe maaltijd
        res.status(201).json({
          message: 'Meal added successfully',
          meal: {
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
  updateMeal : (req, res, next) => {
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
      cookId,
      name,
      description,
      allergenes
    } = req.body;
  
    // Controleer of er überhaupt velden zijn om te updaten
    const fieldsToUpdate = [isActive, isVega, isVegan, isToTakeHome, dateTime, maxAmountOfParticipants, price, imageUrl, cookId, name, description, allergenes];
    const hasUpdate = fieldsToUpdate.some(field => field !== undefined);
  
    if (!hasUpdate) {
      return res.status(400).json({
        status: 400,
        message: 'No fields provided for update'
      });
    }
  
    // Zoek de maaltijd met het gegeven ID
    pool.query('SELECT * FROM meal WHERE id = ?', [id], (err, results) => {
      if (err || results.length === 0) {
        return res.status(404).json({
          status: 404,
          message: 'Meal not found'
        });
      }
  
      const meal = results[0];
  
      // Update de maaltijd met nieuwe waarden of behoud de bestaande waarden
      const updatedMeal = {
        isActive: isActive !== undefined ? isActive : meal.isActive,
        isVega: isVega !== undefined ? isVega : meal.isVega,
        isVegan: isVegan !== undefined ? isVegan : meal.isVegan,
        isToTakeHome: isToTakeHome !== undefined ? isToTakeHome : meal.isToTakeHome,
        dateTime: dateTime !== undefined ? dateTime : meal.dateTime,
        maxAmountOfParticipants: maxAmountOfParticipants !== undefined ? maxAmountOfParticipants : meal.maxAmountOfParticipants,
        price: price !== undefined ? price : meal.price,
        imageUrl: imageUrl !== undefined ? imageUrl : meal.imageUrl,
        cookId: cookId !== undefined ? cookId : meal.cookId,
        name: name !== undefined ? name : meal.name,
        description: description !== undefined ? description : meal.description,
        allergenes: allergenes !== undefined ? allergenes : meal.allergenes
      };
  
      // Update de maaltijd in de database
      pool.query(
        'UPDATE meal SET isActive = ?, isVega = ?, isVegan = ?, isToTakeHome = ?, dateTime = ?, maxAmountOfParticipants = ?, price = ?, imageUrl = ?, cookId = ?, name = ?, description = ?, allergenes = ? WHERE id = ?',
        [updatedMeal.isActive, updatedMeal.isVega, updatedMeal.isVegan, updatedMeal.isToTakeHome, updatedMeal.dateTime, updatedMeal.maxAmountOfParticipants, updatedMeal.price, updatedMeal.imageUrl, updatedMeal.cookId, updatedMeal.name, updatedMeal.description, updatedMeal.allergenes, id],
        (err) => {
          if (err) {
            return res.status(400).json({ status: 400, message: err });
          }
  
          res.status(200).json({ message: 'Meal updated successfully', meal: updatedMeal });
        }
      );
    });
    }
}

module.exports = controller;