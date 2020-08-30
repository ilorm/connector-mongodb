'use strict';

const { ObjectID, } = require('mongodb');

/**
 * Generate ObjectIdField class from Field
 * @param {Field} Field to overload
 * @returns {ObjectIdField} The ObjectId field
 */
const getObjectIdField = ({ Field, }) => {

  /**
   * Class representing an ObjectId field
   */
  class ObjectIdField extends Field {
    /**
     * Cast a value to match the specific field or throw an exception
     * @param {Mixed} value the value to cast
     * @returns {Boolean} value the value casted to the specific schemaField type configuration
     */
    castValue(value) {
      const superValue = super.castValue(value);

      if (superValue === undefined || superValue === null) {
        return new ObjectID();
      }

      return new ObjectID(superValue);
    }

    /**
     * Check if the given value is valid for the given field
     * @param {*} value The value to check
     * @return {boolean} Return true if the given value is valid of the current field
     */
    isValid(value) {
      return ObjectID.isValid(value);
    }

    /**
     * Return the definition of the schema field.
     * (used by ilorm to define exposed)
     * @return {{name: string, factory: string}} Return the definition of this schema field
     */
    static getFieldDefinition() {
      return {
        name: 'ObjectId',
        factory: 'objectId',
      };
    }
  }

  return ObjectIdField;
};

module.exports = getObjectIdField;
