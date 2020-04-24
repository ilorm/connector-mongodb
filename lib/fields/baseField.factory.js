'use strict';

/**
 * Class schema
 * Instantiate a MongoDB schema
 * @param {Field} Field schemaField to extends
 * @returns {MongoDBField} The MongoDB schema field to use
 */
const injectField = (Field) => class MongoDBField extends Field {

};


module.exports = injectField;
