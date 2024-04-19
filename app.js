const express = require('express')
const app = express()
const port = 3000
const appname = 'Salim his app'

app.get('/', (req, res) => {
  res.json({message: 'Hello World!'})
})
app.get('/users', (req, res) => {
  const info = {
    name: 'mijn server',
    version: '1.1'
  }
  res.json(info)
})

app.listen(port, () => {
  console.log( appname + ` is listening on port ${port}`)
})