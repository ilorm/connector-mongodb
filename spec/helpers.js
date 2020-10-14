const { MongoClient, } = require('mongodb');

const StarWarsFixtures = require('./starWars.fixture');

const Ilorm = require('ilorm').constructor;
const ilormMongo = require('../index');

const DB_URL = 'mongodb://localhost:27017/ilorm';

/**
 * Class used to store a test session data (database connection, ilorm instance).
 */
class TestContext {
  // eslint-disable-next-line require-jsdoc
  constructor(Fixtures = StarWarsFixtures) {
    this.ilorm = new Ilorm();

    this.MongoConnector = ilormMongo.init({
      url: DB_URL,
      name: 'ilorm',
    });

    this.ilorm.use(ilormMongo);
    this.fixtures = new Fixtures(this.MongoConnector.database, this.MongoConnector);
  }

  // eslint-disable-next-line require-jsdoc
  getModel() {
    return this.Model;
  }

  // eslint-disable-next-line require-jsdoc
  initModel() {

    // Declare schema :
    const schema = this.fixtures.schema(this.ilorm.Schema);

    const modelConfig = {
      name: this.fixtures.modelName,
      schema,
      connector: new this.MongoConnector({ sourceName: this.fixtures.collectionName, }),
    };

    this.Model = this.ilorm.newModel(modelConfig);
  }

  // eslint-disable-next-line
  async initDb() {
    this.initModel();

    return this.fixtures.initDb();
  }

  // eslint-disable-next-line
  async cleanDb() {
    await this.fixtures.cleanDb();

    const mongoClient = await this.MongoConnector.mongoClient;

    return mongoClient.close();
  }

}


module.exports = TestContext;
