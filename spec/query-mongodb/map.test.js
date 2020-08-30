const { ObjectID, } = require('mongodb');
const TestContext = require('../helpers');
const Ilorm = require('ilorm').constructor;
const ilormMongo = require('../../index');

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

  describe('Schema declaration', () => {
    it('Internal Schema for map need to be a field', () => {
      expect(() => {
        const ilorm = new Ilorm();

        ilorm.use(ilormMongo);

        ilorm.Schema.map(null);
      }).to.throw('internalSchema need to be a Field');

    });
  });

  describe('castValue', () => {
    it('Set a map to undefined or null should re-init at empty map', async () => {
      const MapModel = await testContext.getModel();

      const test = new MapModel();

      test.mapConstraint = null;

      expect(test).to.deep.include({
        mapConstraint: {},
      });

      test.mapConstraint = undefined;

      expect(test).to.deep.include({
        mapConstraint: {},
      });
    });

    it('Should be an object', async () => {
      const MapModel = await testContext.getModel();

      const test = new MapModel();

      expect(() => {
        test.mapConstraint = 3;

      }).to.throw('mapConstraint is expected to be an object (received 3).');
    });

    it('Key should respect the keyValidation (key.length === 2)', async () => {
      const MapModel = await testContext.getModel();
      const test = new MapModel();

      test.mapConstraint = {};

      expect(() => {
        test.mapConstraint.abc = {};

      }).to.throw('Invalid key for the map mapConstraint (received abc).');

      expect(() => {
        test.mapConstraint = {
          abcd: {},
        };

      }).to.throw('Invalid key for the map mapConstraint (received abcd).');
    });
  });

  describe('isValid', () => {
    const ilorm = new Ilorm();

    ilorm.use(ilormMongo);

    const mapField = ilorm.Schema.map(ilorm.Schema.number())
      // eslint-disable-next-line no-magic-numbers
      .setKeyValidator((key) => key.length === 2);

    it('Set a non object as a map is invalid.', async () => {
      expect(await mapField.isValid(null)).to.be.equal(false);
    });

    it('Set a non valid key is invalid.', async () => {
      expect(await mapField.isValid({ keyLengthIsNotTwo: 3, })).to.be.equal(false);
    });

    it('Set a non valid value associated with the key is invalid.', async () => {

      expect(await mapField.isValid({ ab: 'not a number', })).to.be.equal(false);
    });

    it('A valid map is an object with valid key and a valid value.', async () => {
      expect(await mapField.isValid({ va: 3, })).to.be.equal(true);
    });
  });

  describe('MapField including MapField', () => {
    const fixturesMapOfMap = {
      modelName: 'mapOfMap',
      collectionName: 'mapOfMap',
      schema: (Schema) => new Schema({
        mapConstraint: Schema.map(Schema.map(Schema.number())),
      }),
      initDb: async (database) => {
        await database.createCollection('mapOfMap');
        await database.collection('mapOfMap').insertMany([
          {
            _id: new ObjectID('6e9f60bd330f06ee7f76cbe3'),
            mapConstraint: {
              guillaume: {
                daix: 30,
              },
            },
          },
          {
            _id: new ObjectID('533f60bd330f06ee7f76cbe3'),
            mapConstraint: {
              ferdinand: {
                rasumz: 30,
                verdel: 22,
              },
            },
          },
        ]);
      },
      cleanDb: (database) => database.dropCollection('mapOfMap'),
    };

    const testContextMapOfMap = new TestContext(fixturesMapOfMap);

    beforeEach(() => testContextMapOfMap.initDb());
    afterEach(() => testContextMapOfMap.cleanDb());

    it('Should query map of map', async () => {
      const MapModel = await testContextMapOfMap.getModel();

      const result = await MapModel.query()
        .mapConstraint
        .ferdinand
        // eslint-disable-next-line no-magic-numbers
        .rasumz.is(30)
        .findOne();

      // eslint-disable-next-line no-magic-numbers
      expect(result.mapConstraint.ferdinand.rasumz).to.be.equal(30);
    });
  });
});
