const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); 
const database = require('../../db/database');
const assert = require('assert')

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
              result: 'Authentication failed'
            }
            next(error)
          }
        });
      },

  registerUser: async (req, res, next) => {
    const { firstName, lastName, emailAddress, password } = req.body;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    database.add({
      firstName,
      lastName,
      emailAddress,
      password: hashedPassword  
    }, (err, user) => {
      if (err) {
        const error ={
          status:500,
          result: 'Internal server error'
        }
        next(error)
      }
      res.status(201).json({ message: 'User registered successfully', user });
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
