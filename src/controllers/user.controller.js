const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../../db/mysql-db');
const assert = require('assert');

let controller = {
  validateUser: (req, res, next) => {
    let { firstName, lastName, emailAddress, password, street, city } = req.body;

    let missingFields = [];
    if (!firstName) missingFields.push('First name');
    if (!lastName) missingFields.push('Last name');
    if (!emailAddress) missingFields.push('Email address');
    if (!password) missingFields.push('Password');
    if (!street) missingFields.push('Street');
    if (!city) missingFields.push('City');

    if (missingFields.length > 0) {
      return res.status(400).json({
        status: 400,
        message: `Missing required fields: ${missingFields.join(', ')}`,
        data: {}
      });
    }

    try {
      assert(typeof firstName === 'string', 'First name must be a string');
      assert(typeof lastName === 'string', 'Last name must be a string');
      assert(typeof emailAddress === 'string', 'Email address must be a string');
      assert(typeof password === 'string', 'Password must be een string');
      assert(typeof street === 'string', 'Street must be een string');
      assert(typeof city === 'string', 'City must be een string');

      next();
    } catch (error) {
      console.log(error);
      const err = {
        status: 400,
        result: error.toString()
      };
      next(err);
    }
  },

  loginUser: async (req, res, next) => {
    const { emailAddress, password } = req.body;
  
    if (!emailAddress || !password) {
      return res.status(400).json({
        status: 400,
        message: 'Missing required fields: emailAddress and/or password',
        data: {}
      });
    }
  
    pool.query('SELECT * FROM user WHERE emailAdress = ?', [emailAddress], async (err, results) => {
      if (err) {
        console.log("Database error:", err);
        return res.status(500).json({status: 500, message: 'Database error',data: {} });
      }
      
      if (results.length === 0) {
        console.log("User not found");
        return res.status(404).json({status:404, message: 'User not found', data: {} });
      }
  
      const user = results[0];
 
      const isHashed = user.password.startsWith('$2a$') || user.password.startsWith('$2b$') || user.password.startsWith('$2y$');
  
      let passwordMatch = false;
  
      if (isHashed) {
        passwordMatch = await bcrypt.compare(password, user.password);
      } else {
        passwordMatch = password === user.password;
      }
  
      if (passwordMatch) {
        const token = jwt.sign(
          { userId: user.id, email: user.emailAdress },
          'your_jwt_secret',
          { expiresIn: '1h' }
        );
  
        res.json({ status: 200, message: 'Login successful', token, user });
      } else {
        console.log("Password comparison failed");
        return res.status(401).json({ status: 401, message: 'Authentication failed', data:{} });
      }
    });
  },

  getUserById: (req, res, next) => {
    const { id } = req.params; 
  
    pool.query('SELECT * FROM user WHERE id = ?', [id], (err, results) => {
      if (err || results.length === 0) {
        return res.status(404).json({
          status: 404,
          message: 'User not found'
        });
      }

      res.status(200).json({
        status: 200,
        message: 'User retrieved successfully',
        data: results
      });
    })
  },

  registerUser: async (req, res, next) => {
    const { firstName, lastName, emailAddress, password, street, city, phoneNumber } = req.body;

    const existingUser = await new Promise((resolve, reject) => {
      pool.query('SELECT id FROM user WHERE emailAdress = ?', [emailAddress], (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results.length > 0 ? results[0] : null);
        }
      });
    });

    if (existingUser) {
      return res.status(403).json({ status: 403, message: 'User already exists', data: {} });
    }

    bcrypt.genSalt(10, async (err, salt) => {
      if (err) {
        return res.status(500).json({ status: 500, message: 'Error generating salt' });
      }
  
      bcrypt.hash(password, salt, async (err, hashedPassword) => {
        if (err) {
          return res.status(500).json({ status: 500, message: 'Error hashing password' });
        }
  
        pool.query(
          'INSERT INTO user (firstName, lastName, emailAdress, password, street, city, phoneNumber) VALUES (?, ?, ?, ?, ?, ?,?)',
          [firstName, lastName, emailAddress, hashedPassword, street, city, phoneNumber],
          (err, result) => {
            if (err) {
              return res.status(400).json({ status: 400, message: err ,data:{}});
            }
            res.status(201).json({
              message: 'User registered successfully',
              user: { id: result.insertId, firstName, lastName, emailAddress, street, city, phoneNumber }
            });
          }
        );
      })
    })
  },


  getAllUsers: (req, res, next) => {
    const allowedFilters = ['id', 'firstName', 'lastName', 'isActive', 'emailAdress', 'phoneNumber', 'roles', 'street', 'city'];

    let query = 'SELECT * FROM user';
    let queryParams = [];

    let filters = [];

    const queryKeys = Object.keys(req.query);
    const invalidFilters = queryKeys.filter(key => !allowedFilters.includes(key));

    if (invalidFilters.length > 0) {
        return res.status(400).json({
            status: 400,
            message: `Invalid filter(s): ${invalidFilters.join(', ')}`,
            data: {}
        });
    }


    allowedFilters.forEach(filter => {
        if (req.query[filter]) {
            filters.push(`${filter} = ?`);
            queryParams.push(req.query[filter]);
        }
    });

    if (filters.length > 0) {
        query += ' WHERE ' + filters.join(' AND ');
    }

    console.log('Executing query:', query);
    console.log('With parameters:', queryParams);

    pool.query(query, queryParams, (err, results) => {
        if (err) {
            console.log('Error retrieving users:', err);
            return res.status(500).json({
                status: 500,
                message: 'Internal server error while fetching users'
            });
        }

        res.status(200).json({
            status: 200,
            message: 'Users retrieved successfully',
            data: results
        });
    });
},
  getUserProfile: (req, res, next) => {
    const userId = req.user.userId; 

    pool.query('SELECT * FROM user WHERE id = ?', [userId], (err, results) => {
        if (err || results.length === 0) {
            return next({
                status: 404,
                message: 'User not found'
            });
        }

        const user = results[0];

        res.status(200).json({
          status: 200,
          message: 'User retrieved successfully',
          data: user
      });
    });
},

deleteUser: (req, res, next) => {
  const { id } = req.params;

  pool.query('SELECT * FROM user WHERE id = ?', [id], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ status: 500, message: 'Internal server error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ status: 404, message: 'User not found' });
    }

    if (req.user.userId !== parseInt(id)) {
      return res.status(403).json({
        status: 403,
        message: 'Unauthorized to delete this user'
      });
    }

    pool.query('DELETE FROM user WHERE id = ?', [id], (err) => {
      if (err) {
        console.error('Error deleting user:', err);
        return res.status(500).json({ status: 500, message: 'Internal server error' });
      }

      return res.status(200).json({ status: 200, message: 'User deleted successfully' });
    });
  });
},
  updateUser: (req, res, next) => {
    const { id } = req.params;
    const { firstName, lastName, emailAddress, password, street, city } = req.body;

    pool.query('SELECT * FROM user WHERE id = ?', [id], (err, results) => {
      if (err || results.length === 0) {
        return res.status(404).json({
          status: 404,
          message: 'User not found'
        });
      }

      if (req.user.userId !== parseInt(id)) {
        return res.status(403).json({
          status: 403,
          message: 'Unauthorized to update these details'
        });
      }

      if (!emailAddress) {
        return res.status(400).json({
            status: 400,
            message: 'Email address is required'
        });
      }

      const fieldsToUpdate = [firstName, lastName, emailAddress, password, street, city];
      const hasUpdate = fieldsToUpdate.some(field => field !== undefined);
    
      if (!hasUpdate) {
        return res.status(400).json({
          status: 400,
          message: 'No fields provided for update'
        });
      }

      const user = results[0];

      bcrypt.genSalt(10, async (err, salt) => {
        if (err) {
          return res.status(500).json({ status: 500, message: 'Error generating salt' });
        }

        bcrypt.hash(password || user.password, salt, async (err, hashedPassword) => {
          if (err) {
            return res.status(500).json({ status: 500, message: 'Error hashing password' });
          }

          const updatedUser = {
            firstName: firstName || user.firstName,
            lastName: lastName || user.lastName,
            emailAdress: emailAddress || user.emailAdress,
            password: hashedPassword,
            street: street || user.street,
            city: city || user.city
          };

          pool.query(
            'UPDATE user SET firstName = ?, lastName = ?, emailAdress = ?, password = ?, street = ? , city = ? WHERE id = ?',
            [updatedUser.firstName, updatedUser.lastName, updatedUser.emailAdress, updatedUser.password, updatedUser.street, updatedUser.city, id],
            (err) => {
              if (err) {
                return res.status(400).json({ status: 400, message: err });
              }
              res.status(200).json({ status: 200,  message: 'User updated successfully', data: updatedUser });
            }
          );
        });
      });
    });
  }
};

module.exports = controller;
