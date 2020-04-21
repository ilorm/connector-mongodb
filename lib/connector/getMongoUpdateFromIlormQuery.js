'use strict';

const { OPERATIONS, } = require('ilorm-constants').QUERY;
const { OPERATIONS: MONGO_OPERATIONS, } = require('../query/constants');

const CONVERT_OPERATIONS = {
  [OPERATIONS.SET]: '$set',
  [OPERATIONS.ADD]: '$inc',
  [MONGO_OPERATIONS.ADD_TO_SET]: '$addToSet',
  [MONGO_OPERATIONS.POP]: '$pop',
  [MONGO_OPERATIONS.PUSH]: '$push',
};


/**
 * Convert a valid update ilorm ilormQuery to an update mongo ilormQuery.
 * @param {Query} ilormQuery The ilorm ilormQuery you want to convert
 * @returns {mongoUpdate} Return mongoUpdate to apply
 */
function getMongoUpdateFromIlormQuery(ilormQuery) {
  const mongoUpdate = {};

  ilormQuery.updateBuilder({
    onOperator: ({ field, operator, value, }) => {
      if (CONVERT_OPERATIONS[operator]) {
        mongoUpdate[field] = {
          [CONVERT_OPERATIONS[operator]]: value,
        };
      }
    },
  });

  return mongoUpdate;
}

module.exports = getMongoUpdateFromIlormQuery;
