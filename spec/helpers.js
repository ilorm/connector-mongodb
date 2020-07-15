const { MongoClient, } = require('mongodb');

const fixtures = require('./starWars.fixture');

const Ilorm = require('ilorm').constructor;
const ilormMongo = require('../index');

const DB_URL = 'mongodb://localhost:27017/ilorm';

/**
 * Class used to store a test session data (database connection, ilorm instance).
 */
class TestContext {
  // eslint-disable-next-line require-jsdoc
  constructor() {
    this.ilorm = new Ilorm();
    this.ilorm.use(ilormMongo);
  }

  // eslint-disable-next-line require-jsdoc
  getCharactersModel() {
    return this.Model;
  }

  // eslint-disable-next-line require-jsdoc
  initModel() {
    const MongoConnector = ilormMongo.fromDb(this.database);

    // Declare schema :
    const charSchema = fixtures.charactersSchema(this.ilorm.Schema);

    const modelConfig = {
      name: 'characters',
      schema: charSchema,
      connector: new MongoConnector({ collectionName: 'characters', }),
    };

    this.Model = this.ilorm.newModel(modelConfig);
  }

  // eslint-disable-next-line
  async initDb() {
    this.mongoClient = await MongoClient.connect(DB_URL, { useUnifiedTopology: true, });

    this.database = await this.mongoClient.db('ilorm');

    this.initModel();

    return fixtures.initDb(this.database);
  }

  // eslint-disable-next-line
  async cleanDb() {
    await fixtures.cleanDb(this.database);

    return this.mongoClient.close();
  }

}


module.exports = TestContext;
