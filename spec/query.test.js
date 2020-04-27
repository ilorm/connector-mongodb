const { getDatabase, getMongoConnector, } = require('./databaseHelpers');
const { expect, } = require('chai');
const fixtures = require('./starWars.fixture');

// Create a clean instance of ilorm :
const ilorm = require('ilorm');

const { Schema, newModel, } = ilorm;

let database;
let Characters;

// eslint-disable-next-line require-jsdoc
async function initModel() {
  database = await getDatabase();

  const MongoConnector = await getMongoConnector();


  // Declare schema :
  const charSchema = fixtures.charactersSchema(Schema);

  const modelConfig = {
    name: 'characters',
    schema: charSchema,
    connector: new MongoConnector({ collectionName: 'characters', }),
  };

  Characters = newModel(modelConfig);
}

describe('spec ilorm knex', () => {
  describe('Should query data from database', () => {
    before(async () => {
      await initModel();
      await fixtures.initDb(database);
    });

    after(() => fixtures.cleanDb(database));

    it('Should query data, based on criteria', async () => {
      const results = await Characters.query()
        .gender.is('M')
        .name.selectOnly()
        .find();

      expect(results).to.be.deep.equal([
        'Darth Vador',
        'Luke Skywalker',
        'Chewbacca',
      ]);
    });

    it('Should count data, based on criteria', async () => {
      const results = await Characters.query()
        .height.between({
          min: 200,
          max: 300,
        })
        .count();

      // eslint-disable-next-line no-magic-numbers
      expect(results).to.be.deep.equal(2);
    });

    it('Should retrieve on instance, based on criteria', async () => {
    });
  });
});
