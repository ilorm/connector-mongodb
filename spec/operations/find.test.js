
const TestContext = require('../helpers');
const { CHEWBACCA, } = require('../starWars.fixture');

const { expect, } = require('chai');

const testContext = new TestContext();

describe('query.find', () => {
  beforeEach(() => testContext.initDb());
  afterEach(() => testContext.cleanDb());

  it('Should find all element without filters', async () => {
    const Characters = await testContext.getModel();

    const elements = await Characters.query()
      .find();

    // eslint-disable-next-line no-magic-numbers
    expect(elements.length).to.equal(4);
  });

  it('Should find a subset of element if filter is set', async () => {
    const Characters = await testContext.getModel();

    const elements = await Characters.query()
      .name.is(CHEWBACCA.name)
      .find();

    // eslint-disable-next-line no-magic-numbers
    expect(elements.length).to.equal(1);

    expect(elements[0]).to.deep.include(CHEWBACCA);
  });
});

describe('query.findOne', () => {
  beforeEach(() => testContext.initDb());
  afterEach(() => testContext.cleanDb());

  it('Should find only one element without filters', async () => {
    const Characters = await testContext.getModel();

    const element = await Characters.query()
      .findOne();

    // eslint-disable-next-line no-magic-numbers
    expect(element).to.be.an('object');
  });

  it('Should find a given element if filter is set', async () => {
    const Characters = await testContext.getModel();

    const element = await Characters.query()
      .name.is(CHEWBACCA.name)
      .findOne();

    expect(element).to.deep.include(CHEWBACCA);
  });

  it('Should return null if no element match', async () => {
    const Characters = await testContext.getModel();

    const element = await Characters.query()
      .name.is('fake name')
      .findOne();

    expect(element).to.equal(null);
  });
});
