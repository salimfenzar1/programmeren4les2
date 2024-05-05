// database.js
const bcrypt = require('bcryptjs');
let users = []; // Dit zal onze 'database' zijn
let userId = 1;

function add(user, callback) {
  // Eerst controleren of de e-mail al bestaat
  const existingUser = users.find(u => u.emailAddress === user.emailAddress);
  if (existingUser) {
      // Geef een foutmelding terug als het e-mailadres al bestaat
      return callback('Email address already in use', null);
  }

  // Als de e-mail uniek is, voeg dan de gebruiker toe
  const newUser = { ...user, id: userId++ };
  users.push(newUser);
  callback(null, newUser);
}
function addTestUser() {
  const testUser = {
    firstName: 'Salim',
    lastName: 'Fenzar',
    emailAddress: 'salim9@hotmail.nl',
    password: 'test'  // Dit is het platte wachtwoord dat moet worden gehasht
  };

  bcrypt.genSalt(10, (err, salt) => {
    if (err) {
      console.error('Error generating salt:', err);
      return;
    }

    bcrypt.hash(testUser.password, salt, (err, hashedPassword) => {
      if (err) {
        console.error('Error hashing password:', err);
        return;
      }

      // Nu hebben we het gehashte wachtwoord, voegen we de gebruiker toe met het gehashte wachtwoord
      testUser.password = hashedPassword;
      add(testUser, (err, newUser) => {
        if (err) {
          console.error('Error adding test user:', err);
        } else {
          console.log('Test user added with hashed password:', newUser);
        }
      });
    });
  });
}

module.exports = {
  // Voeg een nieuwe gebruiker toe
  add,
  // Vind een gebruiker op basis van email
  findByEmail(email, callback) {
    const user = users.find(u => u.emailAddress === email);
    if (user) {
      callback(null, user);
    } else {
      callback('User not found', null);
    }
  },

  // Vind een gebruiker op basis van ID
  getById(id, callback) {
    const intId = parseInt(id);  
    const user = users.find(u => u.id === intId);
    if (user) {
        callback(null, user);
    } else {
        callback('User not found', null);
    }
},

  delete(id, callback) {
    const intId = parseInt(id);
    const index = users.findIndex(u => u.id === intId);
    if (index !== -1) {
        users.splice(index, 1);
        callback(null, { message: 'User deleted successfully' });
    } else {
        callback('User not found', null);
    }
},
update(updatedUser, callback) {
  const index = users.findIndex(u => u.id === updatedUser.id);
  if (index !== -1) {
      users[index] = {...users[index], ...updatedUser};
      callback(null, users[index]);
  } else {
      callback('User not found', null);
  }
},

  getAll(callback) {
    callback(null, users);
  },
  addTestUser
};
