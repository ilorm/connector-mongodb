const { ObjectID, } = require('mongodb');
const TestContext = require('../helpers');
const Ilorm = require('ilorm').constructor;
const ilormMongo = require('../../index');

const { expect, } = require('chai');

const ELEM_1 = {
  objectConstraint: {
    testString: 'notString',
  },
};

const ELEM_2 = {
  objectConstraint: {
    testString: 'string',
    testNumber: 33,
  },
};

// eslint-disable-next-line require-jsdoc
class ObjectFixture {
  // eslint-disable-next-line require-jsdoc
  constructor(database, MongoConnector) {
    this.database = database;
    this.MongoConnector = MongoConnector;
    this.collectionName = 'object';
  }

  // eslint-disable-next-line require-jsdoc
  schema(Schema) {
    return new Schema({
      objectConstraint: Schema.object({
        testString: Schema.string(),
        testNumber: Schema.number(),
        // eslint-disable-next-line no-magic-numbers
      }),
    });
  }

  // eslint-disable-next-line require-jsdoc
  async initDb() {
    const database = await this.database;

    await database.createCollection('object');
    await database.collection('object').insertMany([
      {
        _id: new ObjectID('5e9f60bd330f06ee7f76cbe3'),
        ...ELEM_1,
      },
      {
        _id: new ObjectID('5eaf60bd330f06ee7f76cbe4'),
        ...ELEM_2,
      },
    ]);
  }
  // eslint-disable-next-line require-jsdoc
  async cleanDb() {
    const database = await this.database;

    return database.dropCollection('object');
  }
}

let testContext = new TestContext(ObjectFixture);

describe('query[objectField]', () => {
  beforeEach(() => {
    testContext = new TestContext(ObjectFixture);

    return testContext.initDb();
  });
  afterEach(() => testContext.cleanDb());

  it('Should query model based on an object field', async () => {
    const objectModel = await testContext.getModel();

    const result = await objectModel.query()
      .objectConstraint
      // eslint-disable-next-line no-magic-numbers
      .testNumber.is(33)
      .findOne();


    expect(result).to.deep.include(ELEM_2);
  });

  describe('Schema declaration', () => {
    it('Internal Schema for object need to be an object', () => {
      expect(() => {
        const ilorm = new Ilorm();

        ilorm.use(ilormMongo);

        ilorm.Schema.object('not an object');
      }).to.throw('internalSchema need to be an Object.');

    });
  });

  describe('castValue', () => {
    it('Set a object to undefined or null should re-init at empty object', async () => {
      const ObjectModel = await testContext.getModel();

      const test = new ObjectModel();

      test.objectConstraint = null;

      expect(test).to.deep.include({
        objectConstraint: {},
      });

      test.objectConstraint = undefined;

      expect(test).to.deep.include({
        objectConstraint: {},
      });
    });

    it('Should be an object', async () => {
      const ObjectModel = await testContext.getModel();

      const test = new ObjectModel();

      expect(() => {
        test.objectConstraint = 3;

      }).to.throw('objectConstraint is expected to be an object (received 3).');
    });
  });

  describe('isValid', () => {
    const ilorm = new Ilorm();

    ilorm.use(ilormMongo);

    const objectField = ilorm.Schema.object({
      testNumber: ilorm.Schema.number(),
    });

    it('Set a non object as a object is invalid.', async () => {
      // eslint-disable-next-line no-magic-numbers
      expect(await objectField.isValid(33)).to.be.equal(false);
    });

    it('Set a non valid value associated with the key is invalid.', async () => {
      expect(await objectField.isValid({ testNumber: 'not a number', })).to.be.equal(false);
    });

    it('Object field could be null', async () => {
      expect(await objectField.isValid(null)).to.be.equal(true);
    });

    it('A valid object is an object with valid key and valids values.', async () => {
      expect(await objectField.isValid({ testNumber: 3, })).to.be.equal(true);
    });
  });

  describe('objectField including objectField', () => {
    // eslint-disable-next-line require-jsdoc
    class FixtureObjectOfObject {
      // eslint-disable-next-line require-jsdoc
      constructor(database, MongoConnector) {
        this.database = database;
        this.MongoConnector = MongoConnector;
        this.collectionName = 'objectOfObject';
      }

      // eslint-disable-next-line require-jsdoc
      schema(Schema) {
        return new Schema({
          objectConstraint: Schema.object({
            subObject: Schema.object({
              test: Schema.number(),
            }),
          }),
        });
      }

      // eslint-disable-next-line require-jsdoc
      async initDb() {
        const database = await this.database;

        await database.createCollection('objectOfObject');
        await database.collection('objectOfObject').insertMany([
          {
            _id: new ObjectID('449f60bd330f06ee7f76cbe3'),
            objectConstraint: {
              subObject: {
                test: 33,
              },
            },
          },
          {
            _id: new ObjectID('543f60bd330f06ee7f76cbe3'),
            objectConstraint: {
              subObject: {
                test: 3223,
              },
            },
          },
        ]);
      }
      // eslint-disable-next-line require-jsdoc
      async cleanDb() {
        const database = await this.database;

        return database.dropCollection('objectOfObject');
      }
    }

    const testContextobjectOfobject = new TestContext(FixtureObjectOfObject);

    beforeEach(() => testContextobjectOfobject.initDb());
    afterEach(() => testContextobjectOfobject.cleanDb());

    it('Should query object of object', async () => {
      const objectModel = await testContextobjectOfobject.getModel();

      const result = await objectModel.query()
        .objectConstraint
        .subObject
        // eslint-disable-next-line no-magic-numbers
        .test.is(33)
        .findOne();

      // eslint-disable-next-line no-magic-numbers
      expect(result.objectConstraint.subObject.test).to.be.equal(33);
    });
  });
});
