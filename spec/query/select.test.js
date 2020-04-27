
const { initDb, cleanDb, getCharactersModel, } = require('./helpers');
const { expect, } = require('chai');

describe('query.[FIELD].select', () => {
  beforeEach(initDb);
  afterEach(cleanDb);

  it('Should select only one field from query', async () => {
    const Characters = await getCharactersModel();

    const char = await Characters.query()
      .name.select()
      .name.is('Luke Skywalker')
      .findOne();

    expect(Object.keys(char)).to.deep.equal([ '_id', 'name', ]);
    expect(char.name).to.be.equal('Luke Skywalker');
  });

  it('Should select two one fields from query', async () => {
    const Characters = await getCharactersModel();

    const char = await Characters.query()
      .name.select()
      .gender.select()
      .name.is('Luke Skywalker')
      .findOne();

    expect(Object.keys(char)).to.deep.equal([ '_id', 'name', 'gender', ]);
    expect(char.name).to.be.equal('Luke Skywalker');
    expect(char.gender).to.be.equal('M');
  });
});

describe('query.[FIELD].selectOnly', () => {
  beforeEach(initDb);
  afterEach(cleanDb);

  it('Should selectOnly one field from query', async () => {
    const Characters = await getCharactersModel();

    const name = await Characters.query()
      .name.selectOnly()
      .name.is('Luke Skywalker')
      .findOne();

    expect(name).to.be.equal('Luke Skywalker');
  });

  it('Should throw an error if trying to selectOnly multiple fields', async () => {
    const Characters = await getCharactersModel();

    // eslint-disable-next-line require-jsdoc
    const queryFactory = () => Characters.query()
      .name.selectOnly()
      .gender.selectOnly()
      .name.is('Luke Skywalker')
      .findOne();

    expect(queryFactory).to.throw('Could not select only field gender, if you already selected others fields.');
  });
});