const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const appname = 'Salim his app';
const loginRouter = require('./src/routes/login.routes');
const { authenticateToken } = require('./src/middleware/auth');

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'This is the homepage', users: 'For users go to /users', info: 'For info navigate to /info' });
});

app.get('/info', (req, res) => {
  const info = {
    name: 'Mijn server',
    version: '1.1'
  };
  res.json(info);
});

app.use(loginRouter);

// Plaats deze handler vlak voor je foutafhandeling middleware
app.all('*', (req, res, next) => {
  res.status(404).json({
      status: 404,
      message: 'Route not found',
      data: {}
  });
});

app.use((error, req, res, next) => {
  res.status(error.status || 500).json({
      status: error.status || 500,
      message: error.message || 'Internal Server Error',
      data: {}
  });
});

app.listen(port, () => {
  console.log(`${appname} is listening on port ${port}`);
});

module.exports = app;
