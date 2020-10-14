const { ObjectID, } = require('mongodb');
const StarWarsFixtures = require('ilorm/spec/common/starWars.fixtures');

// eslint-disable-next-line require-jsdoc
class MongoStarWarsFixtures extends StarWarsFixtures {
  // eslint-disable-next-line require-jsdoc
  constructor(database, MongoConnector) {
    super({
      idGenerator: ObjectID,
      idFieldName: '_id',
    });

    this.database = database;
    this.MongoConnector = MongoConnector;
  }

  // eslint-disable-next-line require-jsdoc
  getCharactersSchema(ilorm) {
    const { Schema, } = ilorm;

    return {
      ...super.getCharactersSchema(ilorm),
      weapons: Schema.array(Schema.string()),
    };
  }

  // eslint-disable-next-line require-jsdoc
  getRacesConnector() {
    return new this.MongoConnector({
      sourceName: 'races',
    });
  }

  // eslint-disable-next-line require-jsdoc
  getCharactersConnector() {
    return new this.MongoConnector({
      sourceName: 'characters',
    });
  }

  // eslint-disable-next-line require-jsdoc
  getCharactersFixture() {
    const Characters = super.getCharactersFixture();

    Characters.DARTH_VADOR = {
      ...Characters.DARTH_VADOR,
      weapons: [ 'lightsaber', ],
    };
    Characters.LUKE = {
      ...Characters.LUKE,
      weapons: [ 'lightsaber', 'blaster', ],
    };
    Characters.CHEWBACCA = {
      ...Characters.CHEWBACCA,
      weapons: [ 'bowcaster', ],
    };
    Characters.LEIA = {
      ...Characters.LEIA,
      weapons: [ 'blaster', ],
    };

    return Characters;
  }

  // eslint-disable-next-line require-jsdoc
  async initDb() {
    const db = await this.database;

    await db.createCollection('race');
    await db.createCollection('characters');
    const Races = this.getRacesFixture();
    const Characters = this.getCharactersFixture();

    await new Promise((resolve, reject) => {
      db.collection('races', async (err, customerCollection) => {
        if (err) {
          reject(err);

          return;
        }
        await customerCollection.insertMany(Object.keys(Races).map((name) => Races[name]));

        resolve();
      });
    });
    await new Promise((resolve, reject) => {
      db.collection('characters', async (err, invoiceCollection) => {
        if (err) {
          reject(err);

          return;
        }
        await invoiceCollection.insertMany(Object.keys(Characters).map((name) => Characters[name]));

        resolve();
      });
    });

  }

  // eslint-disable-next-line require-jsdoc
  async cleanDb() {
    const db = await this.database;

    try {

      await db.dropCollection('race');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
    }
    try {
      await db.dropCollection('characters');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
    }
  }
}

module.exports = MongoStarWarsFixtures;

