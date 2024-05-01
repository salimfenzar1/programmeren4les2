const express = require('express')
const app = express()
const port = 3000
const appname = 'Salim his app'
const loginRouter = require('./src/routes/login.routes')
const { authenticateToken } = require('./src/middleware/auth'); 

app.use(express.json());

app.all('*', (req, res, next) => {
  console.log('Er is op send gedrukt')
  next()
})

app.get('/', (req, res) => {
  res.json({message: 'this is the homepage', users:'for users go to /users', info: 'for info navigate to /info'})
})


app.get('/info', (req, res) => {
  const info = {
    name: 'mijn server',
    version: '1.1'
  }
  res.json(info)
})

app.use(loginRouter)

app.use((req, res, next) => {
  next({
      status: 404,
      message: 'Route not found',
      data: {}
  })
})

app.use((error, req, res, next) => {
  res.status(error.status).json(error)
})

app.listen(port, () => {
  console.log( appname + ` is listening on port ${port}`)
})
module.exports = app