const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); 
const database = require('../../db/database');
const assert = require('assert')
database.addTestUser()

let controller = {
  validateUser: (req, res, next) => {
    let { firstName, lastName, emailAddress, password } = req.body;
    
    let missingFields = [];
    if (!firstName) missingFields.push('First name');
    if (!lastName) missingFields.push('Last name');
    if (!emailAddress) missingFields.push('Email address');
    if (!password) missingFields.push('Password');

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
      assert(typeof password === 'string', 'Password must be a string');

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
        database.findByEmail(emailAddress, async (err, user) => {
          if (err || !user) {
            console.log("User not found or error:", err); 
            return res.status(401).json({ error: 'Authentication failed' });
          }
    
          console.log("User found, comparing password for user:", user); 
          if (await bcrypt.compare(password, user.password)) {
            const token = jwt.sign(
              { userId: user.id, email: user.emailAddress },
              'your_jwt_secret',
              { expiresIn: '1h' }
            );
    
            res.json({ message: 'Login successful', token, user });
          } else {
            console.log("Password comparison failed"); 
            const error ={
              status:401,
              result: 'Authentication failed, log in with emailAddress and password',
            }
            next(error)
          }
        });
      },


      registerUser: async (req, res, next) => {
        const { firstName, lastName, emailAddress, password } = req.body;
    
        bcrypt.genSalt(10, async (err, salt) => {
            if (err) {
                return res.status(500).json({ status: 500, message: 'Error generating salt' });
            }
    
            bcrypt.hash(password, salt, async (err, hashedPassword) => {
                if (err) {
                    return res.status(500).json({ status: 500, message: 'Error hashing password' });
                }
    
                database.add({
                    firstName, lastName, emailAddress, password: hashedPassword
                }, (err, newUser) => {
                    if (err) {
                        return res.status(400).json({ status: 400, message: err });
                    }
                    res.status(201).json({ message: 'User registered successfully', user: newUser });
                });
            });
        });
    },
  getAllUsers: (req, res, next) => {
    database.getAll((err, users) => {
        if (err) {
            console.log('Error retrieving users:', err);
            return res.status(500).json({
                status: 500,
                message: 'Internal server error while fetching users'
            });
        }

        if (!users) {
            users = []; 
        }

        res.status(200).json({
            status: 200,
            message: 'Users retrieved successfully',
            data: users
        });
    });
},
deleteUser: (req, res, next) => {
  const { id } = req.params;

  database.getById(id, (err, user) => {
      if (err) {
          if (err === 'User not found') {
              return res.status(404).json({ status: 404, message: 'User not found' });
          } else {
              console.error('Database error:', err);
              return res.status(500).json({ status: 500, message: 'Internal server error' });
          }
      }

      database.delete(id, (err) => {
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

    database.getById(id, (err, user) => {
        if (err || !user) {
          console.log("niet gevonden")
            return res.status(404).json({
                status: 404,
                message: 'User not found'
            });
        }

        bcrypt.genSalt(10, async (err, salt) => {
            if (err) {
                return res.status(500).json({ status: 500, message: 'Error generating salt' });
            }

            bcrypt.hash(password || user.password, salt, async (err, hashedPassword) => {
                if (err) {
                    return res.status(500).json({ status: 500, message: 'Error hashing password' });
                }
                user.firstName = firstName || user.firstName;
                user.lastName = lastName || user.lastName;
                user.emailAddress = emailAddress || user.emailAddress;
                user.password = hashedPassword;

                database.update(user, (err, updatedUser) => {
                    if (err) {
                        return res.status(400).json({ status: 400, message: err });
                    }
                    res.status(200).json({ message: 'User updated successfully', user: updatedUser });
                });
            });
        });
    });
}
};

module.exports = controller;
