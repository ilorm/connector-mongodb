const { getDatabase, getMongoConnector, } = require('../databaseHelpers');
const fixtures = require('../starWars.fixture');

// Create a clean instance of ilorm :
const ilorm = require('ilorm');

const { Schema, newModel, } = ilorm;

let Characters;

// eslint-disable-next-line require-jsdoc
async function initModel() {
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

// eslint-disable-next-line require-jsdoc
async function getCharactersModel() {
  if (!Characters) {
    await initModel();
  }

  return Characters;
}

// eslint-disable-next-line require-jsdoc
async function initDb() {
  return fixtures.initDb(await getDatabase());
}

// eslint-disable-next-line require-jsdoc
async function cleanDb() {
  return fixtures.cleanDb(await getDatabase());
}

module.exports = {
  initDb,
  cleanDb,
  getCharactersModel,
};
