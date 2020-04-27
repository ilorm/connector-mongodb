const { ObjectID, } = require('mongodb');

// eslint-disable-next-line require-jsdoc
const initDb = async (database) => {
  await database.createCollection('race');
  await database.createCollection('characters');

  await database.collection('race').insertMany([
    {
      _id: new ObjectID('5e9f60bd330f06ee7f76cbe3'),
      name: 'human',
    },
    {
      _id: new ObjectID('5e9f60f7330f06ee7f76cbe5'),
      name: 'wookie',
    },
  ]);

  await database.collection('characters').insertMany([
    {
      _id: new ObjectID('5e9f6101330f06ee7f76cbe7'),
      raceId: new ObjectID('5e9f60bd330f06ee7f76cbe3'),
      name: 'Darth Vador',
      gender: 'M',
      height: 203,
      weapons: [ 'lightsaber', ],
    },
    {
      _id: new ObjectID('5e9f6106330f06ee7f76cbe8'),
      raceId: new ObjectID('5e9f60bd330f06ee7f76cbe3'),
      name: 'Luke Skywalker',
      gender: 'M',
      height: 172,
      weapons: [ 'lightsaber', 'blaster', ],
    },
    {
      _id: new ObjectID('5e9f6111330f06ee7f76cbea'),
      raceId: new ObjectID('5e9f60bd330f06ee7f76cbe3'),
      name: 'Chewbacca',
      gender: 'M',
      height: 230,
      weapons: [ 'bowcaster', ],
    },
    {
      _id: new ObjectID('5e9f6123330f06ee7f76cbec'),
      raceId: new ObjectID('5e9f60bd330f06ee7f76cbe3'),
      name: 'Leia Organa',
      gender: 'F',
      height: 150,
      weapons: [ 'blaster', ],
    },
  ]);
};

// eslint-disable-next-line require-jsdoc
const cleanDb = async (database) => {
  await database.dropCollection('race');
  await database.dropCollection('characters');

};

// eslint-disable-next-line require-jsdoc
const raceSchema = (Schema) => new Schema({
  id: Schema.string(),
  name: Schema.string(),
});

// eslint-disable-next-line require-jsdoc
const charactersSchema = (Schema) => new Schema({
  id: Schema.string(),
  name: Schema.string(),
  raceId: Schema.string(),
  height: Schema.number(),
  gender: Schema.string(),
  weapons: Schema.array(Schema.string()),
});

module.exports = {
  initDb,
  cleanDb,
  raceSchema,
  charactersSchema,
};
