// server.js
const express = require('express');
const bodyParser = require('body-parser');
const db = require('./db');
const routes = require('./routes');

const app =  express();
app.use(bodyParser.json());
app.use('/api', routes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
