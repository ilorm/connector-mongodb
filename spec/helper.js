// Create a clean instance of ilorm :
const ilorm = require('ilorm');
const ilormMongo = require('..');
const { MongoClient, } = require('mongodb');

ilorm.use(ilormMongo);

const DB_URL = 'mongodb://localhost:27017/ilorm';

let database;
let MongoConnector;

// eslint-disable-next-line require-jsdoc
async function initIlormMongo() {
  const mongoClient = await MongoClient.connect(DB_URL, { useUnifiedTopology: true, });

  database = await mongoClient.db('ilorm');

  MongoConnector = ilormMongo.fromDb(database);
}

// eslint-disable-next-line require-jsdoc
async function getDatabase() {
  if (!database) {
    await initIlormMongo();
  }

  return database;
}

// eslint-disable-next-line require-jsdoc
async function getMongoConnector() {
  if (!MongoConnector) {
    await initIlormMongo();
  }

  return MongoConnector;
}

module.exports = {
  getDatabase,
  getMongoConnector,
};
