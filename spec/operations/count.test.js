
const TestContext = require('../helpers');
const { CHEWBACCA, } = require('../starWars.fixture');

const { expect, } = require('chai');

const testContext = new TestContext();

describe('query.count', () => {
  beforeEach(() => testContext.initDb());
  afterEach(() => testContext.cleanDb());

  it('Should count all element without filters', async () => {
    const Characters = await testContext.getModel();

    const amount = await Characters.query()
      .count();

    // eslint-disable-next-line no-magic-numbers
    expect(amount).to.equal(4);
  });

  it('Should count a subset of element if filter is set', async () => {
    const Characters = await testContext.getModel();

    const amount = await Characters.query()
      .name.is(CHEWBACCA.name)
      .count();

    // eslint-disable-next-line no-magic-numbers
    expect(amount).to.equal(1);
  });
});
