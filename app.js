const express = require('express')
const app = express()
const port = 3000
const appname = 'Salim his app'
const userRouter = require('./src/routes/user.routes');

app.use(express.json());

app.all('*', (req, res, next) => {
  console.log('testlog')
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

app.use(userRouter)


app.listen(port, () => {
  console.log( appname + ` is listening on port ${port}`)
})