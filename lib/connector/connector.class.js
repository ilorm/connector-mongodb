'use strict';

const { MongoClient, } = require('mongodb');

const getMongoQueryAndOptionsFromIlormQuery = require('./getMongoQueryAndOptionsFromIlormQuery');
const getMongoUpdateFromIlormQuery = require('./getMongoUpdateFromIlormQuery');
const modelFactory = require('../model/model.factory');
const queryFactory = require('../query/query.factory');

/**
 * Generate a MongoDBConnector by injecting the MongoDB instance
 * @param {Object} db MongoDB db object
 * @param {Object} dbDefinition to Connect to mongoDb
 * @return {MongoDBConnector} The resulting Connector
 */
const injectDependencies = ({ db, dbDefinition, }) => {
  const mongoClient = db ? null : new Promise(async (resolve) => {
    const mongoClient = await MongoClient.connect(dbDefinition.url, { useUnifiedTopology: true, });

    resolve(mongoClient);
  });
  const database = db ? Promise.resolve(db) : new Promise(async (resolve) => {
    const client = await mongoClient;
    const db = await client.db(dbDefinition.dbName);

    resolve(db);
  });

  /**
   * Class representing a ilorm connector binded with MongoDB
   */
  class MongoDBConnector {
    /**
     * Bind current connector with the given table
     * @param {String} sourceName The collection name
     */
    constructor({ sourceName, }) {
      this.collectionName = sourceName;

      this.collectionAsync = new Promise(async (resolve, reject) => {

        const db = await database;

        db.collection(sourceName, (err, collection) => {
          if (err) {
            return reject(err);
          }

          return resolve(collection);
        });
      });
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
    async create({ items, }) {
      const collection = await this.getCollection();

      return collection.insertMany([].concat(items));
    }

    /**
     * Find one or more document into your mongoDb database.
     * @param {Query} query The ilorm query you want to run on your Database.
     * @returns {Promise} Every documents who match the query
     */
    async find(query) {
      const collection = await this.getCollection();
      const { mongoQuery, mongoOptions, } = getMongoQueryAndOptionsFromIlormQuery(query);

      return collection.find(mongoQuery, mongoOptions).toArray();
    }

    /**
     * Find one document from your database
     * @param {Query} query The ilorm query you want to run on your Database.
     * @returns {*|Promise.<Model>|*} The document first found
     */
    async findOne(query) {
      const collection = await this.getCollection();
      const { mongoQuery, mongoOptions, } = getMongoQueryAndOptionsFromIlormQuery(query);

      return collection.findOne(mongoQuery, mongoOptions);
    }

    /**
     * Count the number of document who match the query
     * @param {Query} query The ilorm query you want to run on your Database.
     * @returns {Promise.<Number>} The number of document found
     */
    async count(query) {
      const collection = await this.getCollection();
      const { mongoQuery, mongoOptions, } = getMongoQueryAndOptionsFromIlormQuery(query);

      return collection.countDocuments(mongoQuery, mongoOptions);
    }

    /**
     * Update one or more document who match query
     * @param {Query} query The ilorm query you want to run on your Database.
     * @returns {*} The number of document updated
     */
    async update(query) {
      const collection = await this.getCollection();
      const { mongoQuery, mongoOptions, } = getMongoQueryAndOptionsFromIlormQuery(query);
      const mongoUpdate = getMongoUpdateFromIlormQuery(query);

      const { result, } = await collection.updateMany(mongoQuery, mongoUpdate, mongoOptions);

      return result.nModified;
    }

    /**
     * Update one document who match query
     * @param {Query} query The ilorm query you want to run on your Database.
     * @returns {*} Return true if a document was updated
     */
    async updateOne(query) {
      const collection = await this.getCollection();
      const { mongoQuery, mongoOptions, } = getMongoQueryAndOptionsFromIlormQuery(query);
      const mongoUpdate = getMongoUpdateFromIlormQuery(query);

      const { result, } = await collection.updateOne(mongoQuery, mongoUpdate, mongoOptions);

      return result.nModified;
    }

    /**
     * Remove one or document who match the query
     * @param {Query} query The ilorm query you want to run on your Database.
     * @returns {Promise.<Number>} The number of document removed
     */
    async remove(query) {
      const collection = await this.getCollection();
      const { mongoQuery, mongoOptions, } = getMongoQueryAndOptionsFromIlormQuery(query);

      const { result, } = await collection.deleteMany(mongoQuery, mongoOptions);

      return result.n;
    }

    /**
     * Remove one document who match the query
     * @param {Query} query The ilorm query you want to run on your Database.
     * @returns {Promise.<Boolean>} Return true if a document was removed
     */
    async removeOne(query) {
      const collection = await this.getCollection();
      const { mongoQuery, mongoOptions, } = getMongoQueryAndOptionsFromIlormQuery(query);

      const { result, } = await collection.deleteOne(mongoQuery, mongoOptions);

      return result.n;
    }

    /**
     * Create a stream object from the query
     * @param {Query} query The ilorm query you want to use to generate the stream
     * @returns {Stream} The stream associated with the query/
     */
    async stream(query) {
      const collection = await this.getCollection();
      const { mongoQuery, mongoOptions, } = getMongoQueryAndOptionsFromIlormQuery(query);

      return collection.find(mongoQuery, mongoOptions).stream();
    }

    /**
     * Create a new MongoDBModel from the given params
     * @param {Model} ParentModel The ilorm global Model used as parent of ModelConnector
     * @returns {MongoDBModel} The result MongoDBModel
     */
    modelFactory({ ParentModel, }) {
      return modelFactory({
        ParentModel,
      });
    }

    /**
     * Create a new MongoDBQuery from the given params
     * @param {Query} ParentQuery The ilorm global Query used as parent of QueryConnector
     * @returns {MongoDBQuery} The result MongoDBQuery
     */
    queryFactory({ ParentQuery, }) {
      return queryFactory({ ParentQuery, });
    }



  }

  MongoDBConnector.database = database;
  MongoDBConnector.mongoClient = mongoClient;

  return MongoDBConnector;
};

module.exports = injectDependencies;
