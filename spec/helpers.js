const { MongoClient, } = require('mongodb');

const starWarsFixtures = require('./starWars.fixture');

const Ilorm = require('ilorm').constructor;
const ilormMongo = require('../index');

const DB_URL = 'mongodb://localhost:27017/ilorm';

/**
 * Class used to store a test session data (database connection, ilorm instance).
 */
class TestContext {
  // eslint-disable-next-line require-jsdoc
  constructor(fixtures = null) {
    this.ilorm = new Ilorm();
    this.ilorm.use(ilormMongo);
    this.fixtures = fixtures || starWarsFixtures;
  }

  // eslint-disable-next-line require-jsdoc
  getModel() {
    return this.Model;
  }

  // eslint-disable-next-line require-jsdoc
  initModel() {
    const MongoConnector = ilormMongo.fromDb(this.database);

    // Declare schema :
    const schema = this.fixtures.schema(this.ilorm.Schema);

    const modelConfig = {
      name: this.fixtures.modelName,
      schema,
      connector: new MongoConnector({ collectionName: this.fixtures.collectionName, }),
    };

    this.Model = this.ilorm.newModel(modelConfig);
  }

  // eslint-disable-next-line
  async initDb() {
    this.mongoClient = await MongoClient.connect(DB_URL, { useUnifiedTopology: true, });

    this.database = await this.mongoClient.db('ilorm');

    this.initModel();

    return this.fixtures.initDb(this.database);
  }

  // eslint-disable-next-line
  async cleanDb() {
    await this.fixtures.cleanDb(this.database);

    return this.mongoClient.close();
  }

}


module.exports = TestContext;
