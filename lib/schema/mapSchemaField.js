'use strict';

/**
 * Generate MapSchemaField class from SchemaField
 * @param {SchemaField} SchemaField to overload
 * @returns {MapSchemaField} The Map field
 */
const getMapSchemaField = ({ SchemaField, }) => {

  /**
   * Class representing an Map field
   */
  class MapSchemaField extends SchemaField {
    /**
     * Instantiate a map schemaField by passing his authorized value
     * @param {SchemaField} [internalSchema] Enforce schema of mapSchemaField
     */
    constructor(internalSchema) {
      super();

      if (!internalSchema || typeof internalSchema === 'object') {
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

      return Object.keys(superValue).reduce((acc, field) => ({
        ...acc,
        [field]: this.internalSchema.castValue(superValue[field]),
      }), {});
    }

    /**
     * Declare a function using to validate the key map is valid
     * @param {Function} handler a function returning true or false if the key is parameter is authorized in the map
     * @returns {Void} Return nothing
     */
    setKeyValidator(handler) {
      this.keyValidator = handler;
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

  return MapSchemaField;
};

module.exports = getMapSchemaField;
