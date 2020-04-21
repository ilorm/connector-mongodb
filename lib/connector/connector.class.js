'use strict';

const getMongoQueryAndOptionsFromIlormQuery = require('./getMongoQueryAndOptionsFromIlormQuery',);
const getMongoUpdateFromIlormQuery = require('./getMongoUpdateFromIlormQuery',);
const modelFactory = require('../model/model.factory',);
const queryFactory = require('../query/query.factory',);

/**
 * Generate a MongoDBConnector by injecting the MongoDB instance
 * @param {Object} db MongoDB db object
 * @return {MongoDBConnector} The resulting Connector
 */
const injectDb = ({ db, },) => {

  /**
   * Class representing a ilorm connector binded with MongoDB
   */
  class MongoDBConnector {
    /**
     * Bind current connector with the given table
     * @param {String} collectionName The collection name
     */
    constructor({ collectionName, },) {
      this.collectionName = collectionName;
      this.collectionAsync = new Promise((resolve, reject,) =>
        db.collection(collectionName, (err, collection,) => {
          if (err) {
            return reject(err,);
          }

          return resolve(collection,);
        },),
      );
    }

    /**
     * Get the collection linked with the connector
     * @returns {Promise.<collection>} Return a promise resolving a MongoDB collection
     */
    getCollection() {
      return this.collectionAsync;
    }

    /**
     * Create one or more docs into the database.
     * @param {Object} items The object you want to create in the database
     * @returns {*} The result of the operation
     */
    async create(items,) {
      const collection = await this.getCollection();

      return collection.insertMany(items,);
    }

    /**
     * Find one or more document into your mongoDb database.
     * @param {Query} query The ilorm query you want to run on your Database.
     * @returns {Promise} Every documents who match the query
     */
    async find(query,) {
      const collection = await this.getCollection();
      const { mongoQuery, mongoOptions, } = getMongoQueryAndOptionsFromIlormQuery(query,);

      return collection.find(mongoQuery, mongoOptions,).toArray();
    }

    /**
     * Find one document from your database
     * @param {Query} query The ilorm query you want to run on your Database.
     * @returns {*|Promise.<Model>|*} The document first found
     */
    async findOne(query,) {
      const collection = await this.getCollection();
      const { mongoQuery, mongoOptions, } = getMongoQueryAndOptionsFromIlormQuery(query,);

      return collection.findOne(mongoQuery, mongoOptions,);
    }

    /**
     * Count the number of document who match the query
     * @param {Query} query The ilorm query you want to run on your Database.
     * @returns {Promise.<Number>} The number of document found
     */
    async count(query,) {
      const collection = await this.getCollection();
      const { mongoQuery, mongoOptions, } = getMongoQueryAndOptionsFromIlormQuery(query,);

      return collection.countDocuments(mongoQuery, mongoOptions,);
    }

    /**
     * Update one or more document who match query
     * @param {Query} query The ilorm query you want to run on your Database.
     * @returns {*} The number of document updated
     */
    async update(query,) {
      const collection = await this.getCollection();
      const { mongoQuery, mongoOptions, } = getMongoQueryAndOptionsFromIlormQuery(query,);
      const mongoUpdate = getMongoUpdateFromIlormQuery(query,);

      return collection.updateMany(mongoQuery, mongoUpdate, mongoOptions,);
    }

    /**
     * Update one document who match query
     * @param {Query} query The ilorm query you want to run on your Database.
     * @returns {*} Return true if a document was updated
     */
    async updateOne(query,) {
      const collection = await this.getCollection();
      const { mongoQuery, mongoOptions, } = getMongoQueryAndOptionsFromIlormQuery(query,);
      const mongoUpdate = getMongoUpdateFromIlormQuery(query,);

      return collection.updateOne(mongoQuery, mongoUpdate, mongoOptions,);
    }

    /**
     * Remove one or document who match the query
     * @param {Query} query The ilorm query you want to run on your Database.
     * @returns {Promise.<Number>} The number of document removed
     */
    async remove(query,) {
      const collection = await this.getCollection();
      const { mongoQuery, mongoOptions, } = getMongoQueryAndOptionsFromIlormQuery(query,);

      return collection.deleteMany(mongoQuery, mongoOptions,);
    }

    /**
     * Remove one document who match the query
     * @param {Query} query The ilorm query you want to run on your Database.
     * @returns {Promise.<Boolean>} Return true if a document was removed
     */
    async removeOne(query,) {
      const collection = await this.getCollection();
      const { mongoQuery, mongoOptions, } = getMongoQueryAndOptionsFromIlormQuery(query,);

      return collection.deleteOne(mongoQuery, mongoOptions,);
    }

    /**
     * Create a stream object from the query
     * @param {Query} query The ilorm query you want to use to generate the stream
     * @returns {Stream} The stream associated with the query/
     */
    async stream(query,) {
      const collection = await this.getCollection();
      const { mongoQuery, mongoOptions, } = getMongoQueryAndOptionsFromIlormQuery(query,);

      return collection.find(mongoQuery, mongoOptions,).stream();
    }

    /**
     * Create a new MongoDBModel from the given params
     * @param {Model} ParentModel The ilorm global Model used as parent of ModelConnector
     * @returns {MongoDBModel} The result MongoDBModel
     */
    modelFactory({ ParentModel, schema, },) {
      return modelFactory({
        ParentModel,
      },);
    }

    /**
     * Create a new MongoDBQuery from the given params
     * @param {Query} ParentQuery The ilorm global Query used as parent of QueryConnector
     * @returns {MongoDBQuery} The result MongoDBQuery
     */
    queryFactory({ ParentQuery, },) {
      return queryFactory({ ParentQuery, },);
    }



  }

  return MongoDBConnector;
};

module.exports = injectDb;
