const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
app.use(bodyParser.json());

const HTTP_OK_STATUS = 200;
const PORT = '3000';

app.get('/talker', (_req, res) => {
  const talker = JSON.parse(fs.readFileSync('talker.json'));
  if (!talker.length) return res.status(HTTP_OK_STATUS).json([]);
  return res.status(HTTP_OK_STATUS).json(talker);
});

app.get('/talker/:id', (req, res) => {
  const { id } = req.params;
  const talker = JSON.parse(fs.readFileSync('talker.json'));
  console.log(talker);
  const filteredTalker = talker.find((t) => t.id === +id);
  if (filteredTalker) return res.status(HTTP_OK_STATUS).json(filteredTalker);
  if (!filteredTalker) {
 return res.status(404).json(
    { message: 'Pessoa palestrante não encontrada' },
    ); 
}
});

// não remova esse endpoint, e para o avaliador funcionar
app.get('/', (_request, response) => {
  response.status(HTTP_OK_STATUS).send();
});

app.listen(PORT, () => {
  console.log('Online');
});
