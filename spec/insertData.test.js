const { getDatabase, getMongoConnector, } = require('./databaseHelpers');
const { expect, } = require('chai');

// Create a clean instance of ilorm :
const ilorm = require('ilorm');

const { Schema, newModel, } = ilorm;

let database;
let User;

// eslint-disable-next-line require-jsdoc
async function initModel() {

  database = await getDatabase();

  const MongoConnector = await getMongoConnector();

  // Declare schema;
  const userSchema = new Schema({
    firstName: Schema.string(),
    lastName: Schema.string(),
  });

  const modelConfig = {
    name: 'users',
    schema: userSchema,
    connector: new MongoConnector({ collectionName: 'users', }),
  };

  User = newModel(modelConfig);
}


describe('Should insert data into database', () => {
  before(async () => {
    await initModel();

    await database.createCollection('users');
  });

  after(async () => {
    await database.dropCollection('users');
  });

  it('Should insert data with model saving', async () => {
    const user = new User();

    user.firstName = 'Smith';
    user.lastName = 'Bond';

    await user.save();

    const result = await database.collection('users').findOne({ firstName: 'Smith', });

    expect(result.firstName).to.be.equal('Smith');
    expect(result.lastName).to.be.equal('Bond');
  });
});
