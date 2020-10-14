const InvoiceFixtures = require('ilorm/spec/common/invoices.fixtures');
const { ObjectID, } = require('mongodb');

// eslint-disable-next-line require-jsdoc
class MongoInvoicesFixtures extends InvoiceFixtures {
  // eslint-disable-next-line require-jsdoc
  constructor(database, MongoConnector) {
    super({
      idGenerator: ObjectID,
      idFieldName: '_id',
    });

    this.database = database;
    this.MongoConnector = MongoConnector;
  }

  // eslint-disable-next-line require-jsdoc
  getInvoicesSchema(ilorm) {
    const { Schema, } = ilorm;

    return {
      _id: Schema.objectId().primary(),
      customerId: Schema.objectId().reference({
        referencedModel: 'customers',
        referencedField: '_id',
      }),
      createdAt: Schema.date().default(() => Date.now()),
      paidAt: Schema.date(),
      isPaid: Schema.boolean().default(false),
      amount: Schema.number(),
    };
  }

  // eslint-disable-next-line require-jsdoc
  getCustomersSchema(ilorm) {
    const { Schema, } = ilorm;

    return {
      _id: Schema.objectId().primary(),
      firstName: Schema.string(),
      lastName: Schema.string(),
    };
  }

  // eslint-disable-next-line require-jsdoc
  getAccountsSchema(ilorm) {
    const { Schema, } = ilorm;

    return {
      customerId: Schema.objectId().primary()
        .reference({
          referencedModel: 'customers',
          referencedField: '_id',
        }),
      balance: Schema.number(),
    };
  }


  // eslint-disable-next-line require-jsdoc
  getInvoicesConnector() {
    return new this.MongoConnector({
      sourceName: 'invoices',
    });
  }

  // eslint-disable-next-line require-jsdoc
  getCustomersConnector() {
    return new this.MongoConnector({
      sourceName: 'customers',
    });
  }

  // eslint-disable-next-line require-jsdoc
  getAccountsConnector() {
    return new this.MongoConnector({
      sourceName: 'accounts',
    });
  }

  // eslint-disable-next-line require-jsdoc
  async initDb() {
    const db = await this.database;

    await db.createCollection('customers');
    await db.createCollection('invoices');
    await db.createCollection('accounts');
    const Invoices = this.getInvoicesFixture();
    const Customers = this.getCustomersFixture();
    const Accounts = this.getAccountsFixture();

    await new Promise((resolve, reject) => {
      db.collection('customers', async (err, customerCollection) => {
        if (err) {
          reject(err);

          return;
        }
        await customerCollection.insertMany(Object.keys(Customers).map((CustomerName) => Customers[CustomerName]));

        resolve();
      });
    });
    await new Promise((resolve, reject) => {
      db.collection('invoices', async (err, invoiceCollection) => {
        if (err) {
          reject(err);

          return;
        }
        await invoiceCollection.insertMany(Object.keys(Invoices).map((invoiceName) => Invoices[invoiceName]));

        resolve();
      });
    });
    await new Promise((resolve, reject) => {
      db.collection('accounts', async (err, accountCollection) => {
        if (err) {
          reject(err);

          return;
        }
        await accountCollection.insertMany(Object.keys(Accounts).map((accountName) => Accounts[accountName]));

        resolve();
      });
    });


  }

  // eslint-disable-next-line require-jsdoc
  async cleanDb() {
    const db = await this.database;

    try {
      await db.dropCollection('customers');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
    }
    try {
      await db.dropCollection('invoices');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
    }
    try {
      await db.dropCollection('accounts');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
    }
  }
}

module.exports = MongoInvoicesFixtures;

