const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;
const ENV = process.env.NODE_ENV || 'development';

app.use(express.static('build'));

app.listen(3000, () => {
  console.log(`Server listening on port ${PORT} in ${ENV} mode.`);
});
