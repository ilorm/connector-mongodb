const { expect, } = require('chai');

// Create a clean instance of ilorm :
const ilorm = require('ilorm');
const ilormMongo = require('..');
const { MongoClient, } = require('mongodb');

ilorm.use(ilormMongo);

const { Schema, newModel, } = ilorm;
const DB_URL = 'mongodb://localhost:27017/ilorm';

let database;
let User;

async function initModel() {
  const mongoClient = await MongoClient.connect(DB_URL, { useUnifiedTopology: true, },);
  database = await mongoClient.db('ilorm',);

  const MongoConnector = ilormMongo.fromDb(database);

  // Declare schema;
  const userSchema = new Schema({
    firstName: Schema.string(),
    lastName: Schema.string(),
  });

  const modelConfig = {
    name: 'users',
    schema: userSchema,
    connector: new MongoConnector({ collectionName: 'users', },),
  };

  User = newModel(modelConfig);
}


describe('Should insert data into database', () => {
  before(async () => {
    await initModel();

    await database.createCollection('users',);
  },);

  after(async () => {
  },);

  it('Should insert data with model saving', async () => {
    const user = new User();

    user.firstName = 'Smith';
    user.lastName = 'Bond';

    await user.save();

    const result = await database.collection('users',).findOne({ firstName: 'Smith', },);

    expect(result.firstName,).to.be.equal('Smith',);
    expect(result.lastName,).to.be.equal('Bond',);
  },);
},);
