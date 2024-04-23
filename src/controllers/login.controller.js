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
        return res.status(400).json({ error: 'All fields are required' });
      }else{
        assert(typeof firstName === 'string','first name must be a string')
        assert(typeof lastName === 'string','last name must be a string')
        assert(typeof emailAddress === 'string','email address must be a string')
      }
      next()
    } catch (error) {
      console.log(error)
      res.status(400).json({
        status:400,
        result: error.toString()
      })
    }
  
  },
    loginUser: async (req, res) => {
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
            res.status(401).json({ error: 'Authentication failed' });
          }
        });
      },

  registerUser: async (req, res) => {
    const { firstName, lastName, emailAddress, password } = req.body;

    if (!emailAddress || !password || !firstName || !lastName) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    database.add({
      firstName,
      lastName,
      emailAddress,
      password: hashedPassword  
    }, (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Internal server error' });
      }
      res.status(201).json({ message: 'User registered successfully', user });
    });
  }
};

module.exports = controller;
