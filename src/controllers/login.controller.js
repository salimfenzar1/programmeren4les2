const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); 
const database = require('../../db/database');
const assert = require('assert')
database.addTestUser()

let controller = {
  validateUser:(req,res,next) =>{
    let user = req.body
    let{firstName,lastName, emailAddress,password} = user
    try {
      if (!emailAddress || !password || !firstName || !lastName) {
        return res.status(400).json({ 
          status:400,
          message: 'All fields are required',
          data:{} });
      }else{
        assert(typeof firstName === 'string','first name must be a string')
        assert(typeof lastName === 'string','last name must be a string')
        assert(typeof emailAddress === 'string','email address must be a string')
      }
      next()
    } catch (error) {
      console.log(error)
      const err ={
        status:400,
        result: error.toString()
      }
      next(err)
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
    const { userId } = req.params; 
  
    database.deleteUserById(userId, (err) => {
      if (err) {
        console.log('Error deleting user:', err);
        return res.status(500).json({ status: 500, result: 'Internal server error' });
      }
      res.status(200).json({ 
        status:200,
        message: 'User deleted successfully' });
    });
  }
};

module.exports = controller;
