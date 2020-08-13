require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('app routes', () => {
  beforeAll(done => {
    return client.connect(done);
  });

  beforeEach(() => {
    // TODO: ADD DROP SETUP DB SCRIPT
    execSync('npm run setup-db');
  });

  afterAll(done => {
    return client.end(done);
  });

  skip('returns mls', async() => {

    const expectation = [
      {
        name: 'Portland Timbers',
        league_standing: 1,
        ever_won_a_championship: true,
        conference: 'Western'
      },
      {
        name: 'Orlando City',
        league_standing: 2,
        ever_won_a_championship: false,
        conference: 'Eastern'
      },
      {
        name: 'Philadelphia Union',
        league_standing: 3,
        ever_won_a_championship: false,
        conference: 'Eastern'
      }
    ];

    const data = await fakeRequest(app)
      .get('/mls')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(data.body).toEqual(expectation);
  });
});
