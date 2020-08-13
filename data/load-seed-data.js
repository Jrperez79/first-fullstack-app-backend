const client = require('../lib/client');
// import our seed data:
const mls = require('./mls.js');
const usersData = require('./users.js');
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
      mls.map(teams => {
        return client.query(`
                    INSERT INTO mls (name, league_standing, ever_won_a_championship, conference, owner_id)
                    VALUES ($1, $2, $3, $4, $5);
                `,
        [teams.name, teams.league_standing, teams.ever_won_a_championship, teams.conference, user.id]);
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
