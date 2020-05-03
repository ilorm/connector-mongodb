const { MODEL, } = require('ilorm/lib/constants');
const { ObjectId, } = require('mongodb');

/**
 * Create a new Mongo Model class.
 * @param {Model} ParentModel The Model used as Parent
 * @returns {MongoDBModel} The MongoDBModel created
 */
const mongoModelFactory = ({ ParentModel, }) => (
  class MongoDBModel extends ParentModel {
    /**
     * Traps handler for get a property
     * When you try to get a property on an Ilorm model this method will be called
     * @param {*} property The property of the model to get
     * @return {*} Return the value of the model property
     */
    get(property) {
      return this.subPropertyGetFactory({
        object: this,
        schema: this.constructor[MODEL.SCHEMA].definition,
      })(property);
    }


    /**
     * Create a trap handler get for handling embed object in the model
     * @param {Object} object The object to target
     * @param {IlormSchema} schema The schema linked with the object
     * @param {String[]} parentProperties List of properties parent
     * @returns {subPropertyGet} The trap targeting the object
     */
    subPropertyGetFactory({ object, schema, parentProperties = [], }) {
      const self = this;

      /**
       * Traps handler for get a sub property (property included in an object / map)
       * When you try to get a property on an Ilorm model this method will be called
       * @param {*} property The property of the model to get
       * @return {*} Return the value of the model property
       */
      return function subPropertyGet(property) {
        const isSchemaProperty = schema && schema[property] && property !== 'constructor';

        const isObject =
          (isSchemaProperty && schema[property].constructor.getFieldDefinition().name === 'Object') ||
          (!isSchemaProperty && typeof object[property] === 'object' && !(object instanceof ObjectId));

        if (isObject) {
          if (!object[property]) {
            object[property] = {};
          }

          return new Proxy(object[property], {
            get: (obj, prop) => self.subPropertyGetFactory({
              object: object[property],
              schema: isSchemaProperty ? schema[property].internalSchema : null,
              parentProperties: [ ...parentProperties, property, ],
            })(prop),
            set: (obj, prop, value) => self.subPropertySetFactory({
              object: object[property],
              schema: isSchemaProperty ? schema[property].internalSchema : null,
              parentProperties: [ ...parentProperties, property, ],
            })(prop, value),
          });
        }

        return object[property];
      };
    }

    /**
     * Create a trap handler set for handling embed object in the model
     * @param {Object} object The object to target
     * @param {IlormSchema} schema The schema linked with the object
     * @param {String[]} parentProperties List of properties parent
     * @returns {subPropertySet} The trap targeting the object
     */
    subPropertySetFactory({ object, schema, parentProperties = [], }) {
      const self = this;

      /**
       * Traps handler for set a sub property (property included in an object / map)
       * When you try to set the value of property on an Ilorm Model this method will be called.
       * @param {*} property The property of the model to set
       * @param {*} value The value you want to associate
       * @return {Boolean} Return true if the assignment was a success, false if not
       */
      return function subPropertySet(property, value) {
        // Use to remember which field as been update (case of a loaded instance), use after to update it at save ;
        if (typeof property !== 'symbol') {
          if (parentProperties.length === 0) {
            self[MODEL.LIST_UPDATED_FIELDS].push(property);
          }

          // If property is in the schema, cast it before setting it;
          if (schema[property]) {
            object[property] = schema[property].castValue(value);

            return true;
          }
        }

        // Basic trap behavior when you set a property to an instance:
        object[property] = value;

        return true;
      };
    }


  }
);

module.exports = mongoModelFactory;
