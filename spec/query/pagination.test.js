
const { initDb, cleanDb, getCharactersModel, } = require('./helpers');
const { expect, } = require('chai');

describe('query.limit', () => {
  beforeEach(initDb);
  afterEach(cleanDb);

  it('Should limit to one element', async () => {
    const Characters = await getCharactersModel();

    const characters = await Characters.query()
      .limit(1)
      .find();

    expect(characters.length).to.be.equal(1);
  });
});


describe('query.skip', () => {
  beforeEach(initDb);
  afterEach(cleanDb);

  it('Should skip to next element', async () => {
    const Characters = await getCharactersModel();


    // eslint-disable-next-line require-jsdoc
    const skipQuery = (skipIndex = 0) => Characters.query()
      .skip(skipIndex)
      .limit(2)
      .find();

    const [ elem0, elem1, ] = await skipQuery(0);
    const [ elem1bis, elem2, ] = await skipQuery(1);

    // 0 != 1 && 0 != 1bis && 0 != 2
    expect(elem0).to.not.deep.equal(elem1bis);
    expect(elem0).to.not.deep.equal(elem1);
    expect(elem0).to.not.deep.equal(elem2);

    // 1 === 1bis && 1 !== 2
    expect(elem1).to.deep.equal(elem1bis);
    expect(elem1).to.not.deep.equal(elem2);

    // 1bis !== 2
    expect(elem1bis).to.not.deep.equal(elem2);
  });
});
