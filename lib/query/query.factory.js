const { COLLECTION, } = require('./fields',);
const { CONNECTOR, } = require('ilorm-constants',).QUERY.FIELDS;


/**
 * Inject dependencies to query
 * @param {Query} ParentQuery class Query to overload
 * @returns {MongoDBQuery} The query returned by a mongo model
 */
const injectDependencies = ({ ParentQuery, },) => {

  /**
   * The query overload Query object
   */
  class MongoDBQuery extends ParentQuery {
    /**
     * Instantiate a MongoDBQuery
     * @param {Object} params parameter transmit to parent
     */
    constructor(...params) {
      super(...params,);

      this[COLLECTION] = this[CONNECTOR].getCollection();
    }
  }

  return MongoDBQuery;
};

module.exports = injectDependencies;
