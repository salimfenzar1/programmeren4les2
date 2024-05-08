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
    console.log("Logging in with:", emailAddress, password);

    pool.query('SELECT * FROM user WHERE emailAdress = ?', [emailAddress], async (err, results) => {
      if (err || results.length === 0) {
        console.log("User not found or error:", err);
        return res.status(401).json({ error: 'Authentication failed' });
      }

      const user = results[0];
      console.log("User found, comparing password for user:", user);
      if (await bcrypt.compare(password, user.password)) {
        const token = jwt.sign(
          { userId: user.id, email: user.emailAdress },
          'your_jwt_secret',
          { expiresIn: '1h' }
        );

        res.json({ message: 'Login successful', token, user });
      } else {
        console.log("Password comparison failed");
        const error = {
          status: 401,
          result: 'Authentication failed, log in with emailAddress and password',
        };
        next(error);
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
    const { firstName, lastName, emailAddress, password, street, city } = req.body;
    bcrypt.genSalt(10, async (err, salt) => {
      if (err) {
        return res.status(500).json({ status: 500, message: 'Error generating salt' });
      }

      bcrypt.hash(password, salt, async (err, hashedPassword) => {
        if (err) {
          return res.status(500).json({ status: 500, message: 'Error hashing password' });
        }

        pool.query(
          'INSERT INTO user (firstName, lastName, emailAdress, password, street, city) VALUES (?, ?, ?, ?, ?, ?)',
          [firstName, lastName, emailAddress, hashedPassword, street, city],
          (err, result) => {
            if (err) {
              return res.status(400).json({ status: 400, message: err });
            }
            res.status(201).json({
              message: 'User registered successfully',
              user: { id: result.insertId, firstName, lastName, emailAddress, street, city }
            });
          }
        );
      })
    })
  },


  getAllUsers: (req, res, next) => {
    pool.query('SELECT * FROM user', (err, results) => {
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
        
        res.json({
            Id: user.id,
            Name: user.firstName + ' ' + user.lastName,
            Email: user.emailAdress,
            Address: user.city + ' ' + user.street,
            Description: 'This is your account'
        });
    });
},

  deleteUser: (req, res, next) => {
    const { id } = req.params;

    pool.query('SELECT * FROM user WHERE id = ?', [id], (err, results) => {
      if (err || results.length === 0) {
        return res.status(404).json({ status: 404, message: 'User not found' });
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
    const { firstName, lastName, emailAddress, password } = req.body;

    if (req.user.userId !== parseInt(id)) {
      return res.status(403).json({
        status: 403,
        message: 'Unauthorized to update these details'
      });
    }

    pool.query('SELECT * FROM user WHERE id = ?', [id], (err, results) => {
      if (err || results.length === 0) {
        return res.status(404).json({
          status: 404,
          message: 'User not found'
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
            password: hashedPassword
          };

          pool.query(
            'UPDATE user SET firstName = ?, lastName = ?, emailAdress = ?, password = ? WHERE id = ?',
            [updatedUser.firstName, updatedUser.lastName, updatedUser.emailAdress, updatedUser.password, id],
            (err) => {
              if (err) {
                return res.status(400).json({ status: 400, message: err });
              }
              res.status(200).json({ message: 'User updated successfully', user: updatedUser });
            }
          );
        });
      });
    });
  }
};

module.exports = controller;
