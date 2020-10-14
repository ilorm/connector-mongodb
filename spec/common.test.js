const commonTest = require('ilorm/spec/common');
const CONFIG = require('ilorm/spec/common/config');
const MongoTestContext = require('./testContext.class');

commonTest(MongoTestContext, {
  ...CONFIG,
  extra: {
    ...CONFIG.extra,
    transaction: false,
  },
});
