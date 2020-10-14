'use strict';

const connectorFactory = require('./connector/connector.class');
const schemaFactory = require('./schema/schema.factory');

const baseFieldFactory = require('./fields/baseField.factory');
const modelIdFactory = require('./modelId/modelId.factory');
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

/**
 * Factory for creating the connector from dbUrl and dbName
 * @param {String} url The url to use
 * @param {String} dbName The dbName to use
 * @returns {MongoDBConnector} MongoDBConnector to use with ilorm
 */
const init = ({ url, dbName, }) => connectorFactory({
  dbDefinition: {
    url,
    dbName,
  },
});

module.exports = {
  plugins: {
    core: {
      schemaFactory,
      baseFieldFactory,
      modelIdFactory,
      fieldFactories: {
        arrayField,
        mapField,
        objectField,
        objectIdField,
      },
    },
  },
  fromDb,
  init,
};
