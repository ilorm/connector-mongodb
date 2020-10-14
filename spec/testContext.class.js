const StarWarsFixtures = require('./starWars.fixture');
const InvoicesFixtures = require('./invoices.fixtures');
const TestContext = require('ilorm/spec/common/testContext.class');

// Create a clean instance of ilorm :
const ilormMongo = require('../index');
const DB_URL = 'mongodb://localhost:27017/ilorm';

/**
 * Class used to store a test session data (database connection, ilorm instance).
 */
class MongoTestContext extends TestContext {
  // eslint-disable-next-line require-jsdoc
  constructor(Fixtures) {
    super();

    this.MongoConnector = ilormMongo.init({
      url: DB_URL,
      name: 'ilorm',
    });

    this.ilorm.use(ilormMongo);
    this.fixtures = new Fixtures(this.MongoConnector.database, this.MongoConnector);
  }

  // eslint-disable-next-line require-jsdoc
  static getStarWars() {
    return new this(StarWarsFixtures);
  }

  // eslint-disable-next-line require-jsdoc
  static getInvoices() {
    return new this(InvoicesFixtures);
  }

  // eslint-disable-next-line require-jsdoc
  async finalCleanUp() {
    const mongoClient = await this.MongoConnector.mongoClient;

    return mongoClient.close();
  }
}


module.exports = MongoTestContext;
