// database.js
let users = []; // Dit zal onze 'database' zijn
let userId = 1;

module.exports = {
  // Voeg een nieuwe gebruiker toe
  add(user, callback) {
    const newUser = { ...user, id: userId++ };
    users.push(newUser);
    callback(null, newUser);
  },

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
    const user = users.find(u => u.id === id);
    if (user) {
      callback(null, user);
    } else {
      callback('User not found', null);
    }
  },

  // Verwijder een gebruiker (optioneel, afhankelijk van je use-case)
  delete(id, callback) {
    const index = users.findIndex(u => u.id === id);
    if (index !== -1) {
      users.splice(index, 1);
      callback(null, { message: 'User deleted successfully' });
    } else {
      callback('User not found', null);
    }
  },

  // Voor debug-doeleinden: toon alle gebruikers
  getAll() {
    return users;
  }
};
