const express = require('express')
const router = express.Router()
const database = require("../../db/inmem-db");
router.use(express.json());

router.get('/api/user', (req, res) => {
    database.getAll((err, data) => {
      if (err) {
        console.error(err);
    } else {
       res.json(data);
    }
    })
  })

  router.delete('/api/user/:id', (req, res) => {
    const id = parseInt(req.params.id); 
    database.delete(id, (err, result) => {
      if (err) {
        return res.status(404).json(err);
      } else {
        return res.status(200).json(result);
      }
    })
  })

  router.post('/api/user', (req, res) => {
    const { firstName, lastName, emailAdress } = req.body;
    if (!firstName || !lastName || !emailAdress) {
      return res.status(400).send('Missing data for firstName, lastName, or emailAdress.');
    }
  
    database.add(
      {
          firstName: firstName,
          lastName: lastName,
          emailAdress: emailAdress
      },
      (err, data) => {
          if (err) {
              console.error(err);
              res.status(500).send('Error adding user.');
          } else {
            res.status(201).json({
                message: 'User successfully added',
                status:201,
                result:data
            });
        }
      }
    );
  })

  module.exports = router
  
