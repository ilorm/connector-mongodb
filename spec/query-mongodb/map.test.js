const { ObjectID, } = require('mongodb');
const TestContext = require('../helpers');

const { expect, } = require('chai');

const ELEM_1 = {
  mapConstraint: {
    ab: {
      testString: 'notString',
    },
  },
};

const ELEM_2 = {
  mapConstraint: {
    ab: {
      testString: 'string',
      testNumber: 33,
    },
    cd: {
      testString: 'cd',
      testNumber: 11,
    },
  },
};

const fixtures = {
  modelName: 'map',
  collectionName: 'map',
  schema: (Schema) => new Schema({
    mapConstraint: Schema.map(Schema.object({
      testString: Schema.string(),
      testNumber: Schema.number(),
      // eslint-disable-next-line no-magic-numbers
    })).setKeyValidator((key) => key.length === 2),
  }),
  initDb: async (database) => {
    await database.createCollection('map');
    await database.collection('map').insertMany([
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
  cleanDb: (database) => database.dropCollection('map'),
};

const testContext = new TestContext(fixtures);

describe('query[MapField]', () => {
  beforeEach(() => testContext.initDb());
  afterEach(() => testContext.cleanDb());

  it('Should query model based on an map field', async () => {
    const MapModel = await testContext.getModel();

    const result = await MapModel.query()
      .mapConstraint
      .ab
      // eslint-disable-next-line no-magic-numbers
      .testNumber.is(33)
      .findOne();


    expect(result).to.deep.include(ELEM_2);
  });
});
