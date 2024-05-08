const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const appname = 'Salim his app';
const userRouter = require('./src/routes/user.routes');
const mealRouter = require('./src/routes/meal.routes');
const { authenticateToken } = require('./src/middleware/auth');

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'This is the homepage', users: 'For users go to /api/user', info: 'For info navigate to /info', Login: 'For existing users head to /api/login and login with your credentials' });
});

app.get('/info', (req, res) => {
  const info = {
    name: 'Mijn server',
    version: '1.1'
  };
  res.json(info);
});

app.use(userRouter);
app.use(mealRouter);

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
      data: 'pope'
  });
});

app.listen(port, () => {
  console.log(`${appname} is listening on port ${port}`);
});

module.exports = app;
