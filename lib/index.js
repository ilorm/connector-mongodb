'use strict';

const connectorFactory = require('./connector/connector.class');
const schemaFactory = require('./schema/schema.factory');

const baseFieldFactory = require('./fields/baseField.factory');
const arrayField = require('./fields/arrayField');
const mapField = require('./fields/mapField');
const objectField = require('./fields/objectField');
const objectIdField = require('./fields/objectIdField');

/**
 * Factory for creating the connector
 * @param {db} db MongoDB db object
 * @returns {MongoDBConnector} MongoDBConnector to use with ilorm
 */
const fromDb = (db) => connectorFactory({ db, });

module.exports = {
  plugins: {
    core: {
      schemaFactory,
      baseFieldFactory,
      fieldFactories: {
        arrayField,
        mapField,
        objectField,
        objectIdField,
      },
    },
  },
  fromDb,
};
