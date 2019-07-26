const axios = require('axios');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const model = require('./model.js');
const { authenticate } = require('../auth/authenticate');

module.exports = server => {
  server.post('/api/register', register);
  server.post('/api/login', login);
  server.get('/api/jokes', authenticate, getJokes);
};

function register(req, res) {
  // implement user registration
  let user = req.body;
  const hash = bcrypt.hashSync(user.password, 11)
  user.password = hash;

  model.add(user)
  .then(saved => {
    res.status(201).json(saved);
  })
  .catch(error => {
    res.status(500).json({error: error.message});
  })
}

function login(req, res) {
  // implement user login
  let { username, password } = req.body;
  
  model.findBy({ username })
  .first()
  .then(user => {
    if(user && bcrypt.compareSync(password, user.password)){
      const token = makeToken(user);
      res.status(200).json({token: token});
  } else {
    res.status(401).json({message: "bad creds"});
  }
  })
  .catch(error => {
    res.status(500).json({error: error.message});
  })
}


function makeToken(user) {
  const jwtPayload = {
    subject: user.id,
    username: user.username,
  };

  const jwtOptions = {
    expiresIn: '1d'
  };
  
  const jwtSecret = 'add a .env file to root of project with the JWT_SECRET variable';

  return jwt.sign(jwtPayload, jwtSecret, jwtOptions)
};
function getJokes(req, res) {
  const requestOptions = {
    headers: { accept: 'application/json' },
  };


  axios
    .get('https://icanhazdadjoke.com/search', requestOptions)
    .then(response => {
      res.status(200).json(response.data.results);
    })
    .catch(err => {
      res.status(500).json({ message: 'Error Fetching Jokes', error: err });
    });
}
