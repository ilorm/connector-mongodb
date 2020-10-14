const { COLLECTION, } = require('./fields');
const { QUERY, } = require('ilorm/lib/constants');
const { CONNECTOR, SELECT, } = QUERY.FIELDS;

/**
 * Inject dependencies to query
 * @param {Query} ParentQuery class Query to overload
 * @returns {MongoDBQuery} The query returned by a mongo model
 */
const injectDependencies = ({ ParentQuery, }) => {

  /**
   * The query overload Query object
   */
  class MongoDBQuery extends ParentQuery {
    /**
     * Instantiate a MongoDBQuery
     * @param {Object} params parameter transmit to parent
     */
    constructor(...params) {
      super(...params);

      this[COLLECTION] = this[CONNECTOR].getCollection();
    }


    /**
     * Convert raw result from connector find or findOne to instance or selected field
     * @param {Object} rawResult The raw result to convert
     * @returns {Object|null} The result in function of select behavior
     */
    applySelectBehaviorOnConnectorResult(rawResult) {
      const rawResultParent = super.applySelectBehaviorOnConnectorResult(rawResult);

      // Without raw result, you return null to show the absence of value :
      if (!rawResultParent) {
        return null;
      }

      // Classic way, without select, you only instantiate the child model :
      if (this[SELECT].behavior !== QUERY.SELECT_BEHAVIOR.MULTIPLE) {
        return rawResultParent;
      }

      if (!this[SELECT].fields.includes('_id')) {
        delete rawResultParent._id;
      }

      return rawResultParent;
    }


    /**
     * Trap for getting a property. Overload for handling case of nested property
     * @param {String} property The property to target in the query
     * @returns {QueryOperations} The operations to apply on the field
     */
    get(property) {
      if (typeof property !== 'string' || !property.includes('.')) {
        return super.get(property);
      }

      const properties = property.split('.');

      let propertyOperations = super.get(properties[0]);

      for (let propertyIndex = 1; propertyIndex < properties.length; propertyIndex++) {
        propertyOperations = propertyOperations[properties[propertyIndex]];
      }

      return propertyOperations;
    }
  }

  return MongoDBQuery;
};

module.exports = injectDependencies;
