'use strict'

/*
 * this file must be es5/node4.x compatible so it can be
 * used by the default node interpreter used by the
 * sequelize cli tool
 */

const path = require('path')
const _ = require('lodash')

function maybeLoad (file) {
  try {
    return require(file)
  } catch (e) {
    return {}
  }
}

const userConfig = maybeLoad(path.join(__dirname, '../config.js'))
const defaultConfig = {
  server: {
    port: 3000,
    views: path.join(__dirname, '/views'),
    session: path.join(process.cwd(), '/run/sessions.json'),
    staticFiles: {
      '/static': path.join(__dirname, '/../static'),
      '/static/css/bootswatch': path.join(__dirname, '/../node_modules/bootswatch/paper'),
      '/static/js/delegate': path.join(__dirname, '/../node_modules/delegate/dist'),
      '/static/js/clipboard': path.join(__dirname, '/../node_modules/clipboard/dist')
    }
  },
  sshKeySize: 4096,
  repositoryDir: process.cwd() + '/run/repositories',
  password: { iterations: 5000, algorithm: 'sha512' },
  db: {
    pool: {max: 5, min: 0, idle: 10000},
    dialect: 'sqlite',
    storage: process.cwd() + '/run/mirror-mirror.sqlite3'
  }
}

module.exports = _.defaultsDeep({}, userConfig, defaultConfig)

