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
 * @param {Null|Field[]} ancestorFields if parent field (target a sub document)
 * @returns {{field: *, value: *, mongoOperation: string}[]|*[]|*} Return an array of operation to apply
 */
function convertOperator({ field, operator, value, ancestorFields, }) {
  if (CONVERT_OPERATIONS[operator]) {
    const fieldName = (ancestorFields ? ancestorFields : [])
      .concat(field)
      .map((field) => field[FIELD.NAME])
      .join('.');

    return [
      {
        mongoOperation: CONVERT_OPERATIONS[operator],
        field: fieldName,
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
    onOperator: (mongoOperator) => {
      const mongoOperations = convertOperator(mongoOperator);

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
