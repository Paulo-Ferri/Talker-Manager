// regex para validação do email:
// https://www.codegrepper.com/code-examples/javascript/regex+for+date+mm%2Fdd%2Fyyyy
const dateValidation = /^(0[1-9]|[12][0-9]|3[01])[- /.](0[1-9]|1[012])[- /.](19|20)\d\d$/;
const dateAuthentication = (req, res, next) => {
  const { talk } = req.body;
  if (!Number.isInteger(+talk.rate) || +talk.rate < 1 || +talk.rate > 5) {
    return res.status(400).json({ message: 'O campo "rate" deve ser um inteiro de 1 à 5' });
  }
  next();
};

const talkAuthentication = (req, res, next) => {
  const { talk } = req.body;
  if (!talk || talk.rate === undefined || talk.watchedAt === undefined) {
    return res.status(400).json({
      message: 'O campo "talk" é obrigatório e "watchedAt" e "rate" não podem ser vazios',
    });
  }
  if (dateValidation.test(talk.watchedAt) === false) {
    return res.status(400).json({ message: 'O campo "watchedAt" deve ter o formato "dd/mm/aaaa"' });
  }
  next();
};

module.exports = {
  dateAuthentication,
  talkAuthentication,
};