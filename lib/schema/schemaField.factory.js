'use strict';

/**
 * Class schema
 * Instantiate a MongoDB schema
 * @param {SchemaField} SchemaField schemaField to extends
 * @returns {MongoDBSchemaField} The MongoDB schema field to use
 */
const injectSchemaField = (SchemaField,) => class MongoDBSchemaField extends SchemaField {

};


module.exports = injectSchemaField;
