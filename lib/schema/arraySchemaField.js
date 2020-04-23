'use strict';

const { OPERATIONS, } = require('../query/constants');

/**
 * Generate ArraySchemaField class from SchemaField
 * @param {SchemaField} SchemaField to overload
 * @returns {ArraySchemaField} The new Array field
 */
const getArraySchemaField = ({ SchemaField, }) => {

  /**
   * Class representing an Array field
   */
  class ArraySchemaField extends SchemaField {
    /**
     * Instantiate an array schemaField by passing his authorized value
     * @param {SchemaField} authorizedSchemaField Possible value in the array
     */
    constructor(authorizedSchemaField) {
      super();

      const isSchemaField = authorizedSchemaField && authorizedSchemaField instanceof SchemaField;

      if (authorizedSchemaField && !isSchemaField) {
        throw new Error('authorizedSchemaField need to be a SchemaField');
      }

      this.authorizedSchemaField = authorizedSchemaField;
    }

    /**
     * Cast a value to match the specific field or throw an exception
     * @param {Mixed} value the value to cast
     * @returns {Boolean} value the value casted to the specific schemaField type configuration
     */
    castValue(value) {
      const superValue = super.castValue(value);

      if (superValue === undefined || superValue === null) {
        return [];
      }

      if (!Array.isArray(superValue)) {
        throw new Error(`${superValue} is expected to be an array during the cast process`);
      }

      if (!this.authorizedSchemaField) {
        return superValue;
      }

      return superValue.map((value) => this.authorizedSchemaField.castValue(value));
    }

    /**
     * Check if the given value is valid for the given field
     * @param {*} value The value to check
     * @return {boolean} Return true if the given value is valid of the current field
     */
    async isValid(value) {
      if (!(await super.isValid(value) && (!value || Array.isArray(value))) && !this.authorizedSchemaField) {
        return false;
      }

      return value.reduce((acc, cur) => this.authorizedSchemaField.isValid(cur) && acc, true);
    }

    /**
     * Return the definition of the schema field.
     * (used by ilorm to define exposed)
     * @return {{name: string, factory: string}} Return the definition of this schema field
     */
    static getFieldDefinition() {
      return {
        name: 'Array',
        factory: 'array',
      };
    }

    /**
     * Return the query operation associated with the given schema field
     * @param {Query} query the instance of query to use
     * @param {Array.<String>} additionalOperations Add operations to the field builder
     * @return {Object} The query operations
     */
    getQueryOperations({ query, name, additionalOperations = [], }) {
      return super.getQueryOperations({
        query,
        name,
        additionalOperations: [
          ...additionalOperations,
          OPERATIONS.ADD_TO_SET,
          OPERATIONS.POP,
          OPERATIONS.PUSH,
        ],
      });
    }
  }

  return ArraySchemaField;
};

module.exports = getArraySchemaField;
