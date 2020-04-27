const { getDatabase, getMongoConnector, } = require('./databaseHelpers');
const { Schema, newModel, BaseModel, } = require('ilorm');
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
    after(purgeTest);

    let Model;

    it('Should init the model', async () => {
      Model = await initModel({
        test: Schema.array(),
      });

      expect(Model.prototype).to.be.an.instanceOf(BaseModel);
    });

    it('Should insert data into database', async () => {
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
    after(purgeTest);

    let Traveler;

    it('Should init the model', async () => {
      Traveler = await initModel({
        visitedCities: Schema.array(Schema.string()),
      });

      expect(Traveler.prototype).to.be.an.instanceOf(BaseModel);
    });

    it('Should insert data into database', async () => {
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
    after(purgeTest);

    let Person;

    it('Should init the model', async () => {
      Person = await initModel({
        siblings: Schema.array(Schema.object({
          isSister: Schema.boolean(),
          firstName: Schema.string(),
        })),
      });

      expect(Person.prototype).to.be.an.instanceOf(BaseModel);
    });

    it('Should insert data into database', async () => {
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

    it('Should query model based on an element of an array', async () => {
      const found = await Person.query()
        .siblings.include((subQuery) => subQuery.firstName.is('Jim'))
        .findOne();

      const notFound = await Person.query()
        .siblings.include((subQuery) => subQuery.firstName.is('Benjamin'))
        .findOne();

      // eslint-disable-next-line no-unused-expressions
      expect(notFound).to.be.null;
      expect(found).to.deep.include({
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
