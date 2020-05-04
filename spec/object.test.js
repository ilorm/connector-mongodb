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
    name: 'ModelObject',
    schema,
    connector: new MongoConnector({ collectionName: 'modelObject', }),
  };

  return newModel(modelConfig);
}

/**
 * Clean-up after test, delete collection created during testing process
 * @returns {Promise<void>} Return nothing
 */
async function purgeTest() {
  await (await getDatabase()).dropCollection('modelObject');
}

/**
 * Check if the value was inserted
 * @param {Object} instance Instance to check
 * @returns {Promise<void>} Return nothing, fail or success.
 */
async function expectInsert(instance) {
  const database = await getDatabase();
  const [ collection, ] = (await database.collections('modelObject'));

  const result = await collection
    .findOne({});

  expect(result).to.deep.include(instance);
}

describe('ObjectField', () => {
  describe('With no constraint in the array content', () => {
    after(purgeTest);

    let Model;

    it('Should init the model', async () => {
      Model = await initModel({
        test: Schema.object(),
      });

      expect(Model.prototype).to.be.an.instanceOf(BaseModel);
    });

    it('Should insert data into database', async () => {
      const modelInstance = new Model();

      modelInstance.test = {
        number: 3,
        string: 'test',
        subObject: {
          test: 'maVar',
        },
      };

      await modelInstance.save();

      await expectInsert({
        test: {
          number: 3,
          string: 'test',
          subObject: {
            test: 'maVar',
          },
        },
      });
    });
  });
  describe('With constraint', () => {
    after(purgeTest);

    let Person;

    it('Should init the model', async () => {
      Person = await initModel({
        _id: Schema.string().primary(),
        information: Schema.object({
          firstName: Schema.string(),
          lastName: Schema.string(),
        }),
      });

      expect(Person.prototype).to.be.an.instanceOf(BaseModel);
    });

    it('Should cast embedded field', () => {
      const android = new Person();

      android.information.firstName = 33;
      android.information.lastName = 'android';

      expect(android.information.firstName).to.be.equal('33');
    });

    it('Should insert data into database', async () => {
      const josh = new Person();

      josh.information = {
        firstName: 'Josh',
        lastName: 'Smith',
      };

      await josh.save();

      await expectInsert({
        information: {
          firstName: 'Josh',
          lastName: 'Smith',
        },
      });
    });

    it('Should query model based on an object field', async () => {
      const found = await Person.query()
        .information
        .firstName
        .is('Josh')
        .findOne();

      const notFound = await Person.query()
        .information
        .firstName
        .is('Benjamin')
        .findOne();

      // eslint-disable-next-line no-unused-expressions
      expect(notFound).to.be.null;
      expect(found)
        .to
        .deep
        .include({
          information: {
            firstName: 'Josh',
            lastName: 'Smith',
          },
        });
    });

    it('Should query model based on the full object', async () => {
      const found = await Person.query()
        .information
        .is({
          firstName: 'Josh',
          lastName: 'Smith',
        })
        .findOne();

      const notFound = await Person.query()
        .information
        .is({
          firstName: 'Josh',
        })
        .findOne();

      // eslint-disable-next-line no-unused-expressions
      expect(notFound).to.be.null;
      expect(found)
        .to
        .deep
        .include({
          information: {
            firstName: 'Josh',
            lastName: 'Smith',
          },
        });
    });

    it('Should update embedded field', async () => {
      const josh = await Person.query()
        .information
        .firstName
        .is('Josh')
        .findOne();

      josh.information.firstName = 'Josh Jr';

      await josh.save();

      await expectInsert({
        information: {
          firstName: 'Josh Jr',
          lastName: 'Smith',
        },
      });
    });
  });
});
