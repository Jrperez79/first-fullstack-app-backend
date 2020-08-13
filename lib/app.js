const express = require('express');
const cors = require('cors');
const client = require('./client.js');
const app = express();
const ensureAuth = require('./auth/ensure-auth');
const createAuthRoutes = require('./auth/create-auth-routes');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const authRoutes = createAuthRoutes();

// setup authentication routes to give user an auth token
// creates a /auth/signin and a /auth/signup POST route. 
// each requires a POST body with a .email and a .password
app.use('/auth', authRoutes);

// everything that starts with "/api" below here requires an auth token!
app.use('/api', ensureAuth);

// and now every request that has a token in the Authorization header will have a `req.userId` property for us to see who's talking
app.get('/api/test', (req, res) => {
  res.json({
    message: `in this protected route, we get the user's id like so: ${req.userId}`
  });
});

const fakeUser = {
  id: 1,
  email: 'joel@arbuckle.net',
  hash: '42r8c24'
};

app.get('/mls', async(req, res) => {
  const data = await client.query('SELECT * from mls');

  res.json(data.rows);
});

app.get('/mls/:id', async(req, res) => {
  const mlsId = req.params.id;

  const data = await client.query(`SELECT * from mls where id=${mlsID}`);

  res.json(data.rows[0]);
});

app.post('/mls', async(req, res) => {
  const newMlsTeam = {
    name: req.body.name,
    league_standing: req.body.league_standing,
    ever_won_a_championship: req.body.ever_won_a_championship,
    conference: req.body.conference
  };
  const data = await client.query(`
  INSERT INTO mls(name, league_standing, ever_won_a_championship, conference, owner_id)
  VALUES($1, $2, $3, $4, $5)
  RETURNING *
  `, [newMlsTeam.name, newMlsTeam.league_standing, newMlsTeam.ever_won_a_championship, newMlsTeam.conference, fakeUser.id]);

  res.json(data.row[0]);
});

app.use(require('./middleware/error'));

module.exports = app;
