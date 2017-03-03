'use strict'

const childProcess = require('child-process-promise')
const tmp = require('tmp')
const fs = require('fs')
const Q = require('q')

function getKeyData (key) {
  return new Promise(function (resolve, reject) {
    tmp.file(function (err, path, fd, cleanup) {
      if (err) reject(err)

      Q.nfcall(fs.writeFile, path, key.privateKey, { encoding: 'utf-8', mode: 0o600 })
        .then(function () {
          return Promise.all([
            childProcess.exec('ssh-keygen -y -f "' + path + '"')
              .then(function (output) { return output.stdout }),
            childProcess.exec('ssh-keygen -l -f "' + path + '" | cut -d" " -f2')
              .then(function (output) { return output.stdout })
          ]).then(function (data) {
            cleanup()
            return data
          })
        })
        .then(function (data) {
          resolve({ id: key.id, publicKey: data[0], fingerprint: data[1] })
        })
    })
  })
}

module.exports = {
  up: function (queryInterface, Sequelize) {
    return Promise.resolve()
      .then(function () {
        return queryInterface.sequelize.query('SELECT * FROM repositories', {
          type: Sequelize.QueryTypes.SELECT
        })
      })
      .then(function (repositories) {
        return Promise.resolve()
          .then(function () {
            return queryInterface.renameTable('private_keys', 'ssh_keys')
          })
          .then(function () {
            return queryInterface.renameColumn('ssh_keys', 'content', 'privateKey')
          })
          .then(function () {
            return queryInterface.addColumn('ssh_keys', 'publicKey', Sequelize.TEXT)
          })
          .then(function () {
            return queryInterface.addColumn('ssh_keys', 'fingerprint', Sequelize.STRING)
          })
          .then(function () {
            return Promise.resolve(repositories)
          })
      })
      .then(function (repositories) {
        // renameColumn broke the repository table in sqlite
        // see https://github.com/sequelize/sequelize/issues/7078
        return Promise.all(repositories.map(function (repo) {
          return queryInterface.sequelize.query(
            'UPDATE repositories SET accessKeyId = :keyId WHERE id = :id',
            { replacements: { id: repo.id, keyId: repo.accessKeyId } }
          )
        }))
      })
      .then(function () {
        return queryInterface.sequelize.query(
          'SELECT * FROM ssh_keys',
          { type: Sequelize.QueryTypes.SELECT }
        )
      })
      .then(function (sshKeys) {
        return Promise.all(sshKeys.map(getKeyData))
      })
      .then(function (sshKeys) {
        return Promise.all(sshKeys.map(function (replacements) {
          return queryInterface.sequelize.query(
            'UPDATE ssh_keys SET publicKey = :publicKey, fingerprint = :fingerprint WHERE id = :id',
            { replacements: replacements }
          )
        }))
      })
  },
  down: function (queryInterface) {
    return Promise.resolve()
      .then(function () {
        return queryInterface.renameColumn('ssh_keys', 'privateKey', 'content')
      })
      .then(function () {
        return queryInterface.removeColumn('ssh_keys', 'publicKey')
      })
      .then(function () {
        return queryInterface.removeColumn('ssh_keys', 'fingerprint')
      })
      .then(function () {
        return queryInterface.renameTable('ssh_keys', 'private_keys')
      })
  }
}
