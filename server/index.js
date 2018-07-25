const express = require('express');
const app = express();

const PORT = process.env.PORT || 3001;
const ENV = process.env.NODE_ENV || 'development';

app.use(express.static('build'));

app.get('/api/sample', (request, response) => {
  response.json({});
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT} in ${ENV} mode.`);
});
