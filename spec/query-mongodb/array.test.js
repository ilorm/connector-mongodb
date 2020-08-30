const { ObjectID, } = require('mongodb');
const TestContext = require('../helpers');
const Ilorm = require('ilorm').constructor;
const ilormMongo = require('../../index');

const { expect, } = require('chai');

const ELEM_1 = {
  arrayConstraint:[
    {
      testString: 'notString',
    },
  ],
};

const ELEM_2 = {
  arrayConstraint: [
    {
      testString: 'string',
      testNumber: 33,
    },
    {
      testString: 'cd',
      testNumber: 11,
    },
  ],
};

const fixtures = {
  modelName: 'array',
  collectionName: 'array',
  schema: (Schema) => new Schema({
    arrayConstraint: Schema.array(Schema.object({
      testString: Schema.string(),
      testNumber: Schema.number(),
      // eslint-disable-next-line no-magic-numbers
    })),
    arrayWithoutConstraint: Schema.array(),
  }),
  initDb: async (database) => {
    await database.createCollection('array');
    await database.collection('array').insertMany([
      {
        _id: new ObjectID('5e9f60bd330f06ee7f76cbe3'),
        ...ELEM_1,
      },
      {
        _id: new ObjectID('5eaf60bd330f06ee7f76cbe4'),
        ...ELEM_2,
      },
    ]);
  },
  cleanDb: (database) => database.dropCollection('array'),
};

const testContext = new TestContext(fixtures);

describe('query[ArrayField]', () => {
  beforeEach(() => testContext.initDb());
  afterEach(() => testContext.cleanDb());

  it('Should query model based on an array field', async () => {
    const ArrayModel = await testContext.getModel();

    const result = await ArrayModel.query()
      .arrayConstraint
      // eslint-disable-next-line no-magic-numbers
      .testNumber.is(33)
      .findOne();


    expect(result).to.deep.include(ELEM_2);
  });

  describe('Schema declaration', () => {
    it('Internal Schema for array need to be a field', () => {
      expect(() => {
        const ilorm = new Ilorm();

        ilorm.use(ilormMongo);

        ilorm.Schema.array({});
      }).to.throw('internalSchema need to be a Field');
    });
  });

  describe('castValue', () => {
    it('Set a array to undefined or null should re-init at empty array', async () => {
      const ArrayModel = await testContext.getModel();

      const test = new ArrayModel();

      test.arrayConstraint = null;

      expect(test).to.deep.include({
        arrayConstraint: [],
      });

      test.arrayConstraint = undefined;

      expect(test).to.deep.include({
        arrayConstraint: [],
      });
    });

    it('Should be an object', async () => {
      const ArrayModel = await testContext.getModel();

      const test = new ArrayModel();

      expect(() => {
        test.arrayConstraint = 3;

      }).to.throw('arrayConstraint is expected to be an array (received 3).');
    });

    it('Should not cast if the array does not have constraint', async () => {


      const ArrayModel = await testContext.getModel();

      const test = new ArrayModel();

      // eslint-disable-next-line no-magic-numbers
      test.arrayWithoutConstraint = [ 3, 'test', ];

      expect(test).to.deep.include({
        // eslint-disable-next-line no-magic-numbers
        arrayWithoutConstraint: [ 3, 'test', ],
      });
    });
  });

  describe('isValid', () => {
    const ilorm = new Ilorm();

    ilorm.use(ilormMongo);

    const arrayField = ilorm.Schema.array(ilorm.Schema.number());

    it('Set a non object as a array is invalid.', async () => {
      expect(await arrayField.isValid(null)).to.be.equal(false);
    });

    it('Set a non valid key is invalid.', async () => {
      expect(await arrayField.isValid({ keyLengthIsNotTwo: 3, })).to.be.equal(false);
    });

    it('Set a non valid value associated with the key is invalid.', async () => {

      expect(await arrayField.isValid({ ab: 'not a number', })).to.be.equal(false);
    });

    it('A valid array is an array which contain valid value (or empty).', async () => {
      // eslint-disable-next-line no-magic-numbers
      expect(await arrayField.isValid([ 3, 4, 5, ])).to.be.equal(true);
      // eslint-disable-next-line no-magic-numbers
      expect(await arrayField.isValid([ 3, ])).to.be.equal(true);
      expect(await arrayField.isValid([])).to.be.equal(true);
    });
  });
});
