'use strict'

module.exports = {
  up: function (queryInterface, Sequelize) {
    return Promise.resolve()
      .then(function () {
        return queryInterface.addColumn('synchronizations', 'description', Sequelize.STRING)
      })
      .then(function () {
        return queryInterface.addColumn('synchronizations', 'log', Sequelize.TEXT)
      })
      .then(function () {
        return queryInterface.sequelize.query('SELECT * FROM synchronizations', {
          type: Sequelize.QueryTypes.SELECT
        })
      })
      .then(function (syncs) {
        return Promise.all(syncs.map(function (sync) {
          const query = 'UPDATE synchronizations SET log = :error, description = :description WHERE id = :id'
          return queryInterface.sequelize.query(query, {
            replacements: {
              id: sync.id,
              error: sync.error,
              description: sync.sourceUrl + ' → ' + sync.targetUrl
            }
          })
        }))
      })
      .then(function () {
        return queryInterface.removeColumn('synchronizations', 'error')
      })
      .then(function () {
        return queryInterface.removeColumn('synchronizations', 'mirrorId')
      })
  },
  down: function (queryInterface, Sequelize) {
    return Promise.resolve()
      .then(function () {
        return queryInterface.addColumn('synchronizations', 'error', Sequelize.TEXT)
      })
      .then(function () {
        return queryInterface.addColumn('synchronizations', 'mirrorId', {
          type: Sequelize.INTEGER,
          references: {
            model: 'mirrors',
            key: 'id'
          },
          onUpdate: 'cascade',
          onDelete: 'set null'
        })
      })
      .then(function () {
        return queryInterface.sequelize.query('SELECT * FROM synchronizations', {
          type: Sequelize.QueryTypes.SELECT
        })
      })
      .then(function (syncs) {
        return Promise.all(syncs.map(function (sync) {
          const query = 'UPDATE synchronizations SET error = :log WHERE id = :id'
          return queryInterface.sequelize.query(query, {
            replacements: {
              id: sync.id,
              log: sync.log
            }
          })
        }))
      })
      .then(function () {
        return queryInterface.removeColumn('synchronizations', 'description')
      })
      .then(function () {
        return queryInterface.removeColumn('synchronizations', 'log')
      })
  }
}
