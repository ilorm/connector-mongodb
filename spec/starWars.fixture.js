
// eslint-disable-next-line require-jsdoc
const initDb = async (database) => {
  await database.createCollection('race');
  await database.createCollection('characters');

  await database.collection('race').insertMany([
    {
      id: 'd4f9e1f5-555a-4d3a-9cb0-2a16f22ff50b',
      name: 'human',
    },
    {
      id: '08fb0d7c-499b-40fe-9074-5edc1b091e0a',
      name: 'wookie',
    },
  ]);

  await database.collection('characters').insertMany([
    {
      id: '8eb82c15-4f26-4945-b568-83905b610ba9',
      raceId: 'd4f9e1f5-555a-4d3a-9cb0-2a16f22ff50b',
      name: 'Darth Vador',
      gender: 'M',
      height: 203,
    },
    {
      id: '034d29fc-9dd2-417c-9c5e-8b17011ee0e1',
      raceId: 'd4f9e1f5-555a-4d3a-9cb0-2a16f22ff50b',
      name: 'Luck Skywalker',
      gender: 'M',
      height: 172,
    },
    {
      id: '28adf8e6-7508-40ea-977a-55e08302a352',
      raceId: '08fb0d7c-499b-40fe-9074-5edc1b091e0a',
      name: 'Chewbacca',
      gender: 'M',
      height: 230,
    },
    {
      id: '73eb1c35-a7ca-4ad9-bcd7-a6f037f58471',
      raceId: 'd4f9e1f5-555a-4d3a-9cb0-2a16f22ff50b',
      name: 'Leia Organa',
      gender: 'F',
      height: 150,
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
});

module.exports = {
  initDb,
  cleanDb,
  raceSchema,
  charactersSchema,
};
