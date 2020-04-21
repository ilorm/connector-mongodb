'use strict';

const { OPERATIONS, } = require('ilorm-constants').QUERY;


/**
 * Convert a valid update ilorm ilormQuery to an update mongo ilormQuery.
 * @param {Query} ilormQuery The ilorm ilormQuery you want to convert
 * @returns {mongoUpdate} Return mongoUpdate to apply
 */
function getMongoUpdateFromIlormQuery(ilormQuery) {
  const mongoUpdate = {};

  ilormQuery.updateBuilder({
    onOperator: ({ field, operator, value, }) => {
      if (operator === OPERATIONS.SET) {
        mongoUpdate[field] = {
          $set: value,
        };
      } else {
        mongoUpdate[field] = {
          $inc: value,
        };
      }
    },
  });

  return mongoUpdate;
}

module.exports = getMongoUpdateFromIlormQuery;
