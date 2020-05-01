'use strict';

const { QUERY, FIELD, } = require('ilorm-constants');
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
      if (operator === OPERATIONS.BETWEEN) {
        mongoQuery.push({
          [field[FIELD.NAME]]: {
            $gt: value.min,
          },
        });
        mongoQuery.push({
          [field[FIELD.NAME]]: {
            $lt: value.max,
          },
        });

        return;
      }

      if (operator === MONGO_OPERATIONS.INCLUDE) {
        const handlerInclude = value;


      }

      if (operatorConversion[operator]) {
        mongoQuery.push({
          [field[FIELD.NAME]]: {
            [operatorConversion[operator]]: value,
          },
        });
      }
    },
  });

  return {
    mongoQuery: Object.keys(mongoQuery).length > 0 ? { $and: mongoQuery, } : {},
    mongoOptions,
  };
}

module.exports = getMongoQueryAndOptionsFromIlormQuery;
