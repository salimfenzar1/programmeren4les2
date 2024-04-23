const express = require('express')
const router = express.Router()
const database = require("../../db/inmem-db");
const userController = require('../controllers/users.controller')
router.use(express.json());

router.get('/api/users',userController.getAllUser)

router.get('/api/users/:id',userController.getSpecificUser)

  router.delete('/api/users/:id', userController.deleteUser)

  router.post('/api/users', userController.addUser)

  module.exports = router
  
