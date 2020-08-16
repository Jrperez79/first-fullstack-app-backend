const express = require('express');
const cors = require('cors');
const client = require('./client.js');
const app = express();
const ensureAuth = require('./auth/ensure-auth');
const createAuthRoutes = require('./auth/create-auth-routes');
/*
const conferences = require('../data/conferences.js');
const mls = require('../data/mls.js');
*/

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
  try {
  const data = await client.query(`
      SELECT m.id, m.name, c.name AS conferences_id, league_standing, ever_won_a_championship
        FROM mls AS m 
        JOIN conferences AS c 
        ON m.conferences_id=c.id
      `);

  res.json(data.rows);

  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/conferences', async(req, res) => {
  const data = await client.query(`
      SELECT * FROM conferences`);
  
  res.json(data.rows);
});

app.get('/mls/:id', async(req, res) => {
  try {
  const mlsId = req.params.id;

  const data = await client.query(`
      SELECT m.id, name, c.name AS conferences_id, league_standing, ever_won_a_championship
        FROM mls AS m
        JOIN conferences As c
        On m.conferences_id=c.id
        WHERE m.id=$1
      `, [mlsId]);

  res.json(data.rows[0]);
  
  } catch(e) {
    res.status(500).json({ error: e.message });
  }

});

app.delete('/mls/:id', async(req, res) => {
  const mlsId = req.param.id;

  const data = await client.query('DELETE FROM mls WHERE mls.id=$1;', [mlsId]);

  res.json(data.row[0]);
});

app.put('/mls/:id', async(req, res) => {
  const mlsId = req.param.id;
  
  try {
    const updatedMls = {
      name: req.body.name,
      conference_id: req.body.conferences_id,
      league_standing: req.body.league_standing,
      ever_won_a_championship: req.body.ever_won_a_championship
    };
    
    const data = await client.query(`
      UPDATE mls
        SET name=$1, conferences_id=$2, league_standing=$3, ever_won_a_championship=$4
        WHERE mls.id=$5
        RETURNING *
        `, [updatedMls.name, updatedMls.conferences_id, updatedMls.league_standing, updatedMls.ever_won_a_championship, mlsId]);

    res.json(data.row[0]);
  
    } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/mls', async(req, res) => {
  try {
  const newMlsTeam = {
    name: req.body.name,
    conferences_id: req.body.conferences_id,
    league_standing: req.body.league_standing,
    ever_won_a_championship: req.body.ever_won_a_championship,
  };

  const data = await client.query(`
  INSERT INTO mls(name, conferences_id, league_standing, ever_won_a_championship, owner_id)
  VALUES($1, $2, $3, $4, $5)
  RETURNING *
  `, [newMlsTeam.name, newMlsTeam.conferences_id, newMlsTeam.league_standing, newMlsTeam.ever_won_a_championship, fakeUser.id]);

  res.json(data.row[0]);
  
  } catch(e) {
    res.status(500).json({error: e.message });
  }
});

app.use(require('./middleware/error'));

module.exports = app;
