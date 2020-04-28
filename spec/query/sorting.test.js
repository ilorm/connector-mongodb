
const { initDb, cleanDb, getCharactersModel, } = require('./helpers');
const { expect, } = require('chai');

describe('query.[FIELD].useAsSortAsc', () => {
  beforeEach(initDb);
  afterEach(cleanDb);

  it('Should sort characters by height ascending', async () => {
    const Characters = await getCharactersModel();

    const charactersNameSortByHeight = await Characters.query()
      .name.selectOnly()
      .height.useAsSortAsc()
      .find();

    expect(charactersNameSortByHeight).to.deep.equal([
      'Leia Organa',
      'Luke Skywalker',
      'Darth Vador',
      'Chewbacca',
    ]);
  });
});

describe('query.[FIELD].useAsSortDesc', () => {
  beforeEach(initDb);
  afterEach(cleanDb);

  it('Should sort characters by height descending', async () => {
    const Characters = await getCharactersModel();

    const charactersNameSortByHeight = await Characters.query()
      .name.selectOnly()
      .height.useAsSortDesc()
      .find();

    expect(charactersNameSortByHeight).to.deep.equal([
      'Chewbacca',
      'Darth Vador',
      'Luke Skywalker',
      'Leia Organa',
    ]);
  });
});

