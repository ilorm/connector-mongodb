'use strict';

const { FIELD, } = require('ilorm/lib/constants');

/**
 * Generate MapField class from Field
 * @param {Field} Field to overload
 * @returns {MapField} The Map field
 */
const getMapField = ({ Field, }) => {

  /**
   * Class representing an Map field
   */
  class MapField extends Field {
    /**
     * Instantiate a map schemaField by passing his authorized value
     * @param {Field} [internalSchema] Enforce schema of mapField
     */
    constructor(internalSchema) {
      super();

      if (!internalSchema || typeof internalSchema !== 'object') {
        throw new Error('internalSchema need to be an object');
      }

      this.internalSchema = internalSchema;
      this.keyValidator = () => true;
    }

    /**
     * Cast a value to match the specific field or throw an exception
     * @param {Mixed} value the value to cast
     * @returns {Boolean} value the value casted to the specific schemaField type configuration
     */
    castValue(value) {
      const superValue = super.castValue(value);

      if (superValue === undefined || superValue === null) {
        return {};
      }

      if (typeof superValue !== 'object') {
        throw new Error(`${superValue} is expected to be an object during the cast process`);
      }

      if (typeof this.internalSchema !== 'object') {
        return superValue;
      }

      return Object.keys(superValue).reduce((acc, field) => {
        if (!this.keyValidator(field)) {
          throw new Error(`Invalid key ${field}`);
        }

        return {
          ...acc,
          [field]: this.internalSchema.castValue(superValue[field]),
        };
      }, {});
    }

    /**
     * Declare a function using to validate the key map is valid
     * @param {Function} handler a function returning true or false if the key is parameter is authorized in the map
     * @returns {MapField} Return Field for chaining configuration
     */
    setKeyValidator(handler) {
      this.keyValidator = handler;

      return this;
    }


    /**
     * Check if the given value is valid for the given field
     * @param {*} value The value to check
     * @return {boolean} Return true if the given value is valid of the current field
     */
    async isValid(value) {
      if (!(await super.isValid(value) && (!value || typeof value === 'object')) && !this.internalSchema) {
        return false;
      }

      return Object.keys(value).reduce((isValidAcc, field) => (
        this.internalSchema.isValid(value[field]) && isValidAcc && this.keyValidator(field)
      ), true);
    }

    /**
     * Return the query operation associated with the given schema field
     * @param {Query} query the instance of query to use
     * @param {Array.<String>} additionalOperations Add operations to the field builder
     * @return {Object} The query operations
     */
    getQueryOperations({ query, name, additionalOperations = [], ancestorFields = null, }) {
      const self = this;

      return new Proxy({}, {
        get: (target, property) => {
          const shadowField = {
            [FIELD.NAME]: property,
          };

          const operations = self.internalSchema.getQueryOperations({
            query,
            name,
            additionalOperations: [
              ...additionalOperations,
            ],
            ancestorFields: ancestorFields ? ancestorFields.concat(self, shadowField) : [ self, shadowField, ],
          });

          return operations;
        },
      });
    }

    /**
     * Return the definition of the schema field.
     * (used by ilorm to define exposed)
     * @return {{name: string, factory: string}} Return the definition of this schema field
     */
    static getFieldDefinition() {
      return {
        name: 'Map',
        factory: 'map',
      };
    }
  }

  return MapField;
};

module.exports = getMapField;
