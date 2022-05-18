const express = require('express');
const crypto = require('crypto');
const bodyParser = require('body-parser');
const fs = require('fs');
const nameAuthentication = require('./middlewares/nameAuthentication');
const tokenAuthentication = require('./middlewares/tokenAuthentication');
const ageAuthentication = require('./middlewares/ageAuthentication');
const { dateAuthentication, talkAuthentication } = require('./middlewares/dateAuthentication');

const app = express();
app.use(bodyParser.json());

const HTTP_OK_STATUS = 200;
const PORT = '3000';
const talkerFile = 'talker.json';

app.get('/talker', (_req, res) => {
  const talker = JSON.parse(fs.readFileSync(talkerFile));
  if (!talker.length) return res.status(HTTP_OK_STATUS).json([]);
  return res.status(HTTP_OK_STATUS).json(talker);
});

app.get('/talker/search', tokenAuthentication, (req, res) => {
  const { q: name } = req.query;
  const talkers = JSON.parse(fs.readFileSync(talkerFile));
  if (!name || !name.length) {
    return res.status(200).json(talkers);
  }
  const talkerByName = talkers.filter((t) => t.name.includes(name));
  if (!talkerByName) return res.status(HTTP_OK_STATUS).json([]);
  return res.status(HTTP_OK_STATUS).json(talkerByName);
});

app.get('/talker/:id', (req, res) => {
  const { id } = req.params;
  const talker = JSON.parse(fs.readFileSync('talker.json'));
  const filteredTalker = talker.find((t) => t.id === +id);
  if (filteredTalker) return res.status(HTTP_OK_STATUS).json(filteredTalker);
  if (!filteredTalker) {
 return res.status(404).json(
    { message: 'Pessoa palestrante não encontrada' },
    ); 
}
});

app.put('/talker/:id', tokenAuthentication, nameAuthentication,
ageAuthentication, talkAuthentication, dateAuthentication, (req, res) => {
  const { id } = req.params;
  const { name, age, talk } = req.body;
  const talkers = JSON.parse(fs.readFileSync('talker.json'));
  const talkerById = talkers.find((t) => t.id === +id);
  talkers.splice(talkers.indexOf(talkerById));
  const talkerChanged = {
    id: +id, name, age, talk,
  };
  const allTalkers = [
    ...talkers,
    talkerChanged,
  ];
  fs.writeFileSync('./talker.json', JSON.stringify(allTalkers));
  return res.status(HTTP_OK_STATUS).json(talkerChanged);
});

app.delete('/talker/:id', tokenAuthentication, (req, res) => {
  const { id } = req.params;
  const talkers = JSON.parse(fs.readFileSync('talker.json'));
  const talkerById = talkers.find((t) => t.id === +id);
  talkers.splice(talkers.indexOf(talkerById));
  fs.writeFileSync('./talker.json', JSON.stringify(talkers));
  return res.status(204).end();
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const emailValidation = /\S+@\S+\.\S+/;
  if (!email) {
    return res.status(400).json({ message: 'O campo "email" é obrigatório' });
  }
  if (!password) {
    return res.status(400).json({ message: 'O campo "password" é obrigatório' });
  }
  if (password.length <= 6) {
    return res.status(400).json({ message: 'O "password" deve ter pelo menos 6 caracteres' });
  }
  if (!emailValidation.test(email)) {
    return res.status(400).json({ message: 'O "email" deve ter o formato "email@email.com"' });
}
  return res.status(HTTP_OK_STATUS).json({ token: crypto.randomBytes(8).toString('hex') });
});

app.post('/talker', tokenAuthentication, nameAuthentication,
ageAuthentication, talkAuthentication, dateAuthentication, (req, res) => {
  const { name, age, talk: { watchedAt, rate } } = req.body;
  const talkers = JSON.parse(fs.readFileSync(talkerFile));
  const lastId = talkers.at(-1).id;
  const newTalker = {
    name,
    age,
    id: lastId + 1,
    talk: { watchedAt, rate },
  };
  const allTalkers = [
    ...talkers,
    newTalker,
  ];
  fs.writeFileSync('./talker.json', JSON.stringify(allTalkers));
  return res.status(201).json(newTalker);
});

// não remova esse endpoint, e para o avaliador funcionar
app.get('/', (_request, response) => {
  response.status(HTTP_OK_STATUS).send();
});

app.listen(PORT, () => {
  console.log('Online');
});
