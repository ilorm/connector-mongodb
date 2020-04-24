const { getDatabase, getMongoConnector, } = require('./helper');
const { Schema, newModel, } = require('ilorm');
const { expect, } = require('chai');

/**
 * Init a model to use in the test
 * @param {Object} schemaDefinition the definition of the schema to use
 * @returns {Promise<Model>} The model to use in the test
 */
async function initModel(schemaDefinition) {
  const MongoConnector = await getMongoConnector();

  // Declare schema;
  const schema = new Schema(schemaDefinition);

  const modelConfig = {
    name: 'ModelArray',
    schema,
    connector: new MongoConnector({ collectionName: 'modelArray', }),
  };

  return newModel(modelConfig);
}

/**
 * Clean-up after test, delete collection created during testing process
 * @returns {Promise<void>} Return nothing
 */
async function purgeTest() {
  await (await getDatabase()).dropCollection('modelArray');
}

/**
 * Check if the value was inserted
 * @param {Object} instance Instance to check
 * @returns {Promise<void>} Return nothing, fail or success.
 */
async function expectInsert(instance) {
  const database = await getDatabase();
  const [ collection, ] = (await database.collections('modelArray'));

  const result = await collection
    .findOne({});

  expect(result).to.deep.include(instance);
}

describe('ArrayField', () => {
  describe('With no constraint in the array content', () => {
    afterEach(purgeTest);

    it('Should insert data into database', async () => {
      const Model = await initModel({
        test: Schema.array(),
      });

      const modelInstance = new Model();

      modelInstance.test = [
        1,
        'test',
        { test: 'maVar', },
      ];

      await modelInstance.save();

      await expectInsert({
        test: [
          1,
          'test',
          { test: 'maVar', },
        ],
      });
    });
  });
  describe('With string as array constraint', () => {
    afterEach(purgeTest);

    it('Should insert data into database', async () => {
      const Traveler = await initModel({
        visitedCities: Schema.array(Schema.string()),
      });

      const josh = new Traveler();

      josh.visitedCities = [
        'Paris',
        'London',
        'Moscow',
      ];

      await josh.save();

      await expectInsert({
        visitedCities: [
          'Paris',
          'London',
          'Moscow',
        ],
      });
    });
  });
  describe('With object as array constraint', () => {
    afterEach(purgeTest);

    it('Should insert data into database', async () => {
      const Person = await initModel({
        siblings: Schema.array(Schema.object({
          isSister: Schema.boolean(),
          firstName: Schema.string(),
        })),
      });

      const josh = new Person();

      josh.siblings = [
        {
          isSister: true,
          firstName: 'Pauline',
        },
        {
          isSister: false,
          firstName: 'Jim',
        },
      ];

      await josh.save();

      await expectInsert({
        siblings: [
          {
            isSister: true,
            firstName: 'Pauline',
          },
          {
            isSister: false,
            firstName: 'Jim',
          },
        ],
      });
    });
  });
});
