'use strict';

const { QUERY, } = require('ilorm/lib/constants');
const { OPERATIONS, } = require('../query/constants');

/**
 * Generate ArrayField class from Field
 * @param {Field} Field to overload
 * @returns {ArrayField} The new Array field
 */
const getArrayField = ({ Field, }) => {

  /**
   * Class representing an Array field
   */
  class ArrayField extends Field {
    /**
     * Instantiate an array schemaField by passing his authorized value
     * @param {Field} authorizedField Possible value in the array
     */
    constructor(authorizedField) {
      super();

      const isField = authorizedField && authorizedField instanceof Field;

      if (authorizedField && !isField) {
        throw new Error('authorizedField need to be a Field');
      }

      this.authorizedField = authorizedField;
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

      if (!this.authorizedField) {
        return superValue;
      }

      return superValue.map((value) => this.authorizedField.castValue(value));
    }

    /**
     * Check if the given value is valid for the given field
     * @param {*} value The value to check
     * @return {boolean} Return true if the given value is valid of the current field
     */
    async isValid(value) {
      if (!(await super.isValid(value) && (!value || Array.isArray(value))) && !this.authorizedField) {
        return false;
      }

      return value.reduce((acc, cur) => this.authorizedField.isValid(cur) && acc, true);
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
      const operations = super.getQueryOperations({
        query,
        name,
        additionalOperations: [
          ...additionalOperations,
          OPERATIONS.ADD_TO_SET,
          OPERATIONS.POP,
          OPERATIONS.PUSH,
        ],
      });

      if (this.authorizedField && this.authorizedField.internalSchema) {
        const objectQuery = {
          field: this,
          operator: OPERATIONS.OBJECT_QUERY,
          value: {
            [QUERY.FIELDS.QUERY]: [],
            [QUERY.FIELDS.UPDATE]: [],
          },
        };

        query[QUERY.FIELDS.QUERY].push(objectQuery);

        const { internalSchema, } = this.authorizedField;

        Object.keys(internalSchema).forEach((internalFieldName) => {
          operations[internalFieldName] = internalSchema[internalFieldName].getQueryOperations({
            query: objectQuery.value,
            chainObject: query,
            name: internalFieldName,
          });
        });
      }

      return operations;
    }
  }

  return ArrayField;
};

module.exports = getArrayField;
