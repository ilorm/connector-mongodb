const { expect, } = require('chai');
const fixtures = require('./starWars.fixture');

// Create a clean instance of ilorm :
const ilorm = require('ilorm');
const ilormMongo = require('..');
const { MongoClient, } = require('mongodb');

ilorm.use(ilormMongo);

const { Schema, newModel, } = ilorm;
const DB_URL = 'mongodb://localhost:27017/ilorm';

let database;
let Characters;

async function initModel() {
  const mongoClient = await MongoClient.connect(DB_URL, { useUnifiedTopology: true, },);
  database = await mongoClient.db('ilorm',);

  const MongoConnector = ilormMongo.fromDb(database);


// Declare schema :
  const charSchema = fixtures.charactersSchema(Schema);

  const modelConfig = {
    name: 'characters', // Optional, could be useful to know the model name
    schema: charSchema,
    connector: new MongoConnector({ collectionName: 'characters', }),
  };

  Characters = newModel(modelConfig);
}

describe('spec ilorm knex', () => {
  describe('Should query data from database', () => {
    before(async () => {
      await initModel();
      await fixtures.initDb(database,);
    });

    after(async () => await fixtures.cleanDb(database,),);

    it('Should query data, based on criteria', async () => {
      const results = await Characters.query()
        .gender.is('M')
        .name.selectOnly()
        .find();

      expect(results).to.be.deep.equal([
        'Darth Vador',
        'Luck Skywalker',
        'Chewbacca',
      ]);
    });

    it('Should count data, based on criteria', async () => {
      const results = await Characters.query()
        .height.between({
          min: 200,
          max: 300,
        },)
        .count();

      expect(results).to.be.deep.equal(2,);
    });

    it('Should retrieve on instance, based on criteria', async () => {
    });
  });
});
