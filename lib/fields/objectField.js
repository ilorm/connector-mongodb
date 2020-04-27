'use strict';

/**
 * Generate ObjectField class from Field
 * @param {Field} Field to overload
 * @returns {ObjectField} The Object field
 */
const getObjectField = ({ Field, }) => {

  /**
   * Class representing an Object field
   */
  class ObjectField extends Field {
    /**
     * Instantiate an object schemaField by passing his authorized value
     * @param {Field} [internalSchema] Enforce schema of objectField
     */
    constructor(internalSchema) {
      super();

      if (internalSchema && typeof internalSchema !== 'object') {
        throw new Error('internalSchema need to be an object');
      }

      this.internalSchema = internalSchema;
      this.internalFieldsList = Object.keys(internalSchema || {});
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
      return this.internalFieldsList.reduce((acc, field) => ({
        ...acc,
        [field]: this.internalSchema[field].castValue(superValue[field]),
      }), {});
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

      return this.internalFieldsList.reduce((isValidAcc, field) => (
        this.internalSchema[field].isValid(value) && isValidAcc
      ), true);
    }

    /**
     * Return the definition of the schema field.
     * (used by ilorm to define exposed)
     * @return {{name: string, factory: string}} Return the definition of this schema field
     */
    static getFieldDefinition() {
      return {
        name: 'Object',
        factory: 'object',
      };
    }
  }

  return ObjectField;
};

module.exports = getObjectField;