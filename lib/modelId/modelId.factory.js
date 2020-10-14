const { ObjectID, } = require('mongodb');

/**
 * Overload the model id factory
 * @param {Function} parentModelIdFactory The function used to generate a ModelId from a Model
 * @returns {Function} Return the factory called by the Model to generate the bound ModelId
 */
function injectParentModelId(parentModelIdFactory) {
  /**
   * Create a class BaseModel Id bound with ilorm and the given model
   * @param {Object} param to bound with the child factory
   * @returns {BaseModelId} Return BaseModelId
   */
  return function injectModel(param) {

    return class MongoDbModelId extends parentModelIdFactory(param) {
      /**
       * Instantiate the baseModelId bound with the given id
       * @param {Mixed} id The id linked with ModelId
       */
      constructor(id) {
        if (typeof id === 'object' && ObjectID.isValid(id)) {
          id = id.toString();
        }

        super(id);
      }
    };
  };
}

module.exports = injectParentModelId;
