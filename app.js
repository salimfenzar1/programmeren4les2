const express = require('express')
const app = express()
const port = 3000
const appname = 'Salim his app'

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log( appname + ` is listening on port ${port}`)
})