'use strict';

const connectorFactory = require('./connector/connector.class');
const schemaFactory = require('./schema/schema.factory');
const schemaFieldFactory = require('./schema/schemaField.factory');

const arraySchemaField = require('./schema/arraySchemaField');
const mapSchemaField = require('./schema/mapSchemaField');
const objectSchemaField = require('./schema/objectSchemaField');

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
      schemaFieldFactory,
      schemaFieldFactories: {
        arraySchemaField,
        mapSchemaField,
        objectSchemaField,
      },
    },
  },
  fromDb,
};
