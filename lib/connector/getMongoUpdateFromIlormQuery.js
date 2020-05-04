'use strict';

const { QUERY, FIELD, } = require('ilorm/lib/constants');
const { OPERATIONS, } = QUERY;
const { OPERATIONS: MONGO_OPERATIONS, } = require('../query/constants');

const CONVERT_OPERATIONS = {
  [OPERATIONS.SET]: '$set',
  [OPERATIONS.ADD]: '$inc',
  [MONGO_OPERATIONS.ADD_TO_SET]: '$addToSet',
  [MONGO_OPERATIONS.POP]: '$pop',
  [MONGO_OPERATIONS.PUSH]: '$push',
};

/**
 * Create mongoQuery from field, operator and value
 * @param {Field} field The targeted field
 * @param {String} operator The operator to use
 * @param {Mixed} value The parameter to apply to the operator
 * @returns {{field: *, value: *, mongoOperation: string}[]|*[]|*} Return an array of operation to apply
 */
function convertOperator({ field, operator, value, }) {
  if (operator === MONGO_OPERATIONS.OBJECT_QUERY) {
    const subQuery = value[QUERY.FIELDS.UPDATE];

    const mongoOperations = subQuery.reduce((otherOperations, operation) => [
      ...otherOperations,
      ...convertOperator(operation),
    ], []);

    if (mongoOperations.length === 0) {
      return [];
    }

    return mongoOperations.map((mongoOperation) => ({
      ...mongoOperation,
      field: `${field[FIELD.NAME]}.${mongoOperation.field}`,
    }));
  }

  if (CONVERT_OPERATIONS[operator]) {
    return [
      {
        mongoOperation: CONVERT_OPERATIONS[operator],
        field: field[FIELD.NAME],
        value,
      },
    ];
  }

  return [];
}


/**
 * Convert a valid update ilorm ilormQuery to an update mongo ilormQuery.
 * @param {Query} ilormQuery The ilorm ilormQuery you want to convert
 * @returns {mongoUpdate} Return mongoUpdate to apply
 */
function getMongoUpdateFromIlormQuery(ilormQuery) {
  const mongoUpdate = {};

  ilormQuery.updateBuilder({
    onOperator: ({ field, operator, value, }) => {
      const mongoOperations = convertOperator({
        field,
        operator,
        value,
      });

      mongoOperations.forEach(({ mongoOperation, field, value, }) => {
        if (!mongoUpdate[mongoOperation]) {
          mongoUpdate[mongoOperation] = {};
        }

        mongoUpdate[mongoOperation][field] = value;
      });
    },
  });

  return mongoUpdate;
}

module.exports = getMongoUpdateFromIlormQuery;
