const { expect, } = require('chai');

// Create a clean instance of ilorm :
const Ilorm = require('ilorm').constructor;
const ilormKnex = require('..');
const knex = require('knex')({
  client: 'mysql',
  connection: {
    host : '127.0.0.1',
    user : 'root',
    password : 'root',
    database : 'test',
    multipleStatements: true
  }
});

const knexConnection = ilormKnex.fromKnex(knex);

const ilorm = new Ilorm();

ilorm.use(ilormKnex);
const { Schema, newModel, } = ilorm;

// Declare schema :
const userSchema = new Schema({
  firstName: Schema.string(),
  lastName: Schema.string()
});

const modelConfig = {
  name: 'users', // Optional, could be useful to know the model name
  schema: userSchema,
  connector: new knexConnection({ tableName: 'users' }),
};

const User = newModel(modelConfig);

describe('spec ilorm knex', () => {
  describe('Should insert data into database', () => {
    before(async () => {
      await knex.schema.createTable('users', (table) => {
        table.string('firstName');
        table.string('lastName');
      });
    });

    after(async () => {
      await knex.schema.dropTable('users');

      await knex.destroy();
    });

    it('Should insert data with model saving', async () => {
      const user = new User();
      user.firstName = 'Smith';
      user.lastName = 'Bond';

      await user.save();

      const results = await knex.table('users').first('firstName', 'lastName');

      expect(results.firstName).to.be.equal('Smith');
      expect(results.lastName).to.be.equal('Bond');
    });
  });
});
