const client = require('../lib/client');
// import our seed data:
const mls = require('./mls.js');
const usersData = require('./users.js');
const conferencesData = require('./conferences.js');
const { getEmoji } = require('../lib/emoji.js');

run();

async function run() {

  try {
    await client.connect();

    const users = await Promise.all(
      usersData.map(user => {
        return client.query(`
                      INSERT INTO users (email, hash)
                      VALUES ($1, $2)
                      RETURNING *;
                  `,
        [user.email, user.hash]);
      })
    );
      
    const user = users[0].rows[0];

    await Promise.all(
      conferencesData.map(conference => {
        return client.query(`
                      INSERT INTO conferences (name)
                      VALUES ($1)
                  `,
        [conference.name]);
      })
    );

    await Promise.all(
      mls.map(teams => {
        return client.query(`
                    INSERT INTO mls (name, conferences_id, league_standing, ever_won_a_championship, owner_id)
                    VALUES ($1, $2, $3, $4, $5);
                `,
        [teams.name, teams.conferences_id, teams.league_standing, teams.ever_won_a_championship, user.id]);
      })
    );
    

    console.log('seed data load complete', getEmoji(), getEmoji(), getEmoji());
  }
  catch(err) {
    console.log(err);
  }
  finally {
    client.end();
  }
    
}
