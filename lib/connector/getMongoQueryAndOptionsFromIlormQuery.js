'use strict';

const { QUERY, FIELD, } = require('ilorm/lib/constants');
const { OPERATIONS, SORT_BEHAVIOR, } = QUERY;
const { OPERATIONS: MONGO_OPERATIONS, } = require('../query/constants');

const operatorConversion = {
  [OPERATIONS.IS]: '$eq',
  [OPERATIONS.IS_NOT]: '$ne',
  [OPERATIONS.IS_IN]: '$in',
  [OPERATIONS.IS_NOT_IN]: '$nin',
  [OPERATIONS.GREATER_THAN]: '$gt',
  [OPERATIONS.LOWER_THAN]: '$lt',
  [OPERATIONS.GREATER_OR_EQUAL_THAN]: '$gte',
  [OPERATIONS.LOWER_OR_EQUAL_THAN]: '$lte',
};


const ASCENDING = 1;
const DESCENDING = -1;

/**
 * Fetch mongoQuery from field / operator / Value
 * @param {Field} field The field to apply the operator
 * @param {String} operator The operator to apply
 * @param {Mixin} value The value to apply
 * @returns {[]} Return MongoQuery operation to apply
 */
function convertOperator({ field, operator, value, }) {
  if (operator === OPERATIONS.BETWEEN) {
    return [
      {
        [field[FIELD.NAME]]: {
          $gt: value.min,
        },
      }, {
        [field[FIELD.NAME]]: {
          $lt: value.max,
        },
      },
    ];
  }

  if (operator === MONGO_OPERATIONS.OBJECT_QUERY) {
    const subQuery = value[QUERY.FIELDS.QUERY];

    const mongoOperations = subQuery.reduce((otherOperations, operation) => [
      ...otherOperations,
      ...convertOperator(operation),
    ], []);

    if (mongoOperations.length === 0) {
      return [];
    }

    return mongoOperations.map((mongoOperation) => {
      const [ key, ] = Object.keys(mongoOperation);

      return {
        [`${field[FIELD.NAME]}.${key}`]: mongoOperation[key],
      };
    });
  }

  if (operatorConversion[operator]) {
    return [
      {
        [field[FIELD.NAME]]: {
          [operatorConversion[operator]]: value,
        },
      },
    ];
  }

  return [];
}

/**
 * Convert a valid inputQuery to a query
 * @param {Query} ilormQuery The ilorm query you want to convert
 * @returns {{mongoQuery, mongoOptions}} Return mongoQuery and mongoOptions to use as parameter of MongoDB functions
 */
function getMongoQueryAndOptionsFromIlormQuery(ilormQuery) {
  const mongoQuery = [];
  const mongoOptions = {};

  ilormQuery.queryBuilder({
    onOptions: ({ skip, limit, }) => {
      if (limit) {
        mongoOptions.limit = limit;
      }
      if (skip) {
        mongoOptions.skip = skip;
      }
    },
    onOr: (arrayOfQuery) => {
      mongoQuery.push({
        $or: arrayOfQuery.map((query) => getMongoQueryAndOptionsFromIlormQuery(query).mongoQuery),
      });
    },
    onSelect: ({ field, }) => {
      if (!mongoOptions.projection) {
        mongoOptions.projection = {};
      }
      mongoOptions.projection[field[FIELD.NAME]] = 1;
    },
    onSort: ({ field, behavior, }) => {
      if (!mongoOptions.sort) {
        mongoOptions.sort = {};
      }

      mongoOptions.sort[field[FIELD.NAME]] = behavior === SORT_BEHAVIOR.ASCENDING ? ASCENDING : DESCENDING;
    },
    onOperator: ({ field, operator, value, }) => {
      const mongoOperators = convertOperator({
        field,
        operator,
        value,
      });

      mongoOperators.forEach((mongoOperator) => mongoQuery.push(mongoOperator));
    },
  });

  return {
    mongoQuery: Object.keys(mongoQuery).length > 0 ? { $and: mongoQuery, } : {},
    mongoOptions,
  };
}

module.exports = getMongoQueryAndOptionsFromIlormQuery;
