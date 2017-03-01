'use strict'

module.exports = {
  up: function (queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.createTable('users', {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
        name: Sequelize.STRING,
        email: Sequelize.STRING,
        password: Sequelize.STRING,
        salt: Sequelize.STRING,
        createdAt: { type: Sequelize.DATE, allowNull: false },
        updatedAt: { type: Sequelize.DATE, allowNull: false }
      }),
      queryInterface.createTable('private_keys', {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
        name: Sequelize.STRING,
        content: Sequelize.TEXT,
        createdAt: { type: Sequelize.DATE, allowNull: false },
        updatedAt: { type: Sequelize.DATE, allowNull: false },
        userId: {
          type: Sequelize.INTEGER,
          references: {
            model: 'users',
            key: 'id'
          },
          onUpdate: 'cascade',
          onDelete: 'set null'
        }
      }),
      queryInterface.createTable('repositories', {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
        name: Sequelize.STRING,
        url: Sequelize.STRING,
        createdAt: { type: Sequelize.DATE, allowNull: false },
        updatedAt: { type: Sequelize.DATE, allowNull: false },
        accessKeyId: {
          type: Sequelize.INTEGER,
          references: {
            model: 'private_keys',
            key: 'id'
          },
          onUpdate: 'cascade',
          onDelete: 'set null'
        },
        userId: {
          type: Sequelize.INTEGER,
          references: {
            model: 'users',
            key: 'id'
          },
          onUpdate: 'cascade',
          onDelete: 'set null'
        }
      }),
      queryInterface.createTable('mirrors', {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
        name: Sequelize.STRING,
        uuid: Sequelize.UUID,
        createdAt: { type: Sequelize.DATE, allowNull: false },
        updatedAt: { type: Sequelize.DATE, allowNull: false },
        sourceRepositoryId: {
          type: Sequelize.INTEGER,
          references: {
            model: 'repositories',
            key: 'id'
          },
          onUpdate: 'cascade',
          onDelete: 'set null'
        },
        targetRepositoryId: {
          type: Sequelize.INTEGER,
          references: {
            model: 'repositories',
            key: 'id'
          },
          onUpdate: 'cascade',
          onDelete: 'set null'
        },
        userId: {
          type: Sequelize.INTEGER,
          references: {
            model: 'users',
            key: 'id'
          },
          onUpdate: 'cascade',
          onDelete: 'set null'
        }
      }),
      queryInterface.createTable('synchronizations', {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
        sourceUrl: Sequelize.STRING,
        targetUrl: Sequelize.STRING,
        startedOn: Sequelize.DATE,
        finishedOn: Sequelize.DATE,
        wasSuccessful: Sequelize.BOOLEAN,
        error: Sequelize.TEXT,
        createdAt: { type: Sequelize.DATE, allowNull: false },
        updatedAt: { type: Sequelize.DATE, allowNull: false },
        mirrorId: {
          type: Sequelize.INTEGER,
          references: {
            model: 'mirrors',
            key: 'id'
          },
          onUpdate: 'cascade',
          onDelete: 'set null'
        },
        userId: {
          type: Sequelize.INTEGER,
          references: {
            model: 'users',
            key: 'id'
          },
          onUpdate: 'cascade',
          onDelete: 'set null'
        }
      })
    ])
  },
  down: function (queryInterface) {
    return Promise.all([
      queryInterface.dropTable('synchronizations'),
      queryInterface.dropTable('mirrors'),
      queryInterface.dropTable('repositories'),
      queryInterface.dropTable('private_keys'),
      queryInterface.dropTable('users')
    ])
  }
}
