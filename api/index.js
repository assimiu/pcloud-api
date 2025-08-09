const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Olá, Mundo!');
});

app.get('/:nome', (req, res) => {
  const { nome } = req.params;
  res.send(`Olá, ${nome}!`);
});

module.exports = app;