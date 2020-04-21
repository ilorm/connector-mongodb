
/**
 * Create a new Mongo Model class.
 * @param {Model} ParentModel The Model used as Parent
 * @returns {MongoDBModel} The MongoDBModel created
 */
const mongoModelFactory = ({ ParentModel, },) => (
  class MongoDBModel extends ParentModel {

  }
);

module.exports = mongoModelFactory;
