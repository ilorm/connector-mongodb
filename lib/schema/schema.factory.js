'use strict';

/**
 * Class schema
 * Instantiate a MongoDB schema
 * @param {Schema} Schema schema to extends
 * @returns {MongoDBSchema} The MongoDB schema to use
 */
const injectSchema = (Schema,) => class MongoDBSchema extends Schema {

};


module.exports = injectSchema;
