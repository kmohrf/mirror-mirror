'use strict'

/*
 * this file must be es5/node4.x compatible so it can be
 * loaded by the default node interpreter used by the
 * sequelize cli tool
 */

const path = require('path')
const _ = require('lodash')
const pkg = require('../package.json')

function maybeLoad (file) {
  try {
    return require(file)
  } catch (e) {
    return {}
  }
}

const cwd = process.cwd()
const defaultUserConfigPath = path.join(__dirname, '../config.js')
const envUserConfigPath = _.get(process.env, 'MIRRORMIRROR_CONFIG', false)
const userConfig = envUserConfigPath ? require(envUserConfigPath) : maybeLoad(defaultUserConfigPath)
const baseConfig = {
  pkg,
  server: {
    views: path.join(__dirname, '/views'),
    staticFiles: {
      '/static': path.join(__dirname, '/../static'),
      '/static/css/bootswatch': path.join(__dirname, '/../node_modules/bootswatch/paper'),
      '/static/js/delegate': path.join(__dirname, '/../node_modules/delegate/dist'),
      '/static/js/clipboard': path.join(__dirname, '/../node_modules/clipboard/dist')
    }
  },
  twig: {
    globals: {
      pkg,
      menu: {
        '/app/ssh-keys': 'SSH Keys',
        '/app/repositories': 'Repositories',
        '/app/mirrors': 'Mirrors',
        '/app/synchronizations': 'Synchronizations'
      }
    }
  }
}
const defaultConfig = {
  // origin used when generating absolute urls. null to use origin from request.
  origin: null,
  server: {
    // server port
    port: 3000,
    // session storage
    session: path.join(cwd, '/run/sessions.json')
  },
  // ssh key size used when generating ssh keys from the frontend
  sshKeySize: 4096,
  // directory where repositories are created when syncing mirrors
  repositoryDir: path.join(cwd, '/run/repositories'),
  // settings for encoding passwords. you’re not like to need something else
  password: { iterations: 5000, algorithm: 'sha512' },
  // database settings. default is a persistent sqlite database
  db: {
    pool: { max: 5, min: 0, idle: 10000 },
    dialect: 'sqlite',
    storage: path.join(cwd, '/run/mirror-mirror.sqlite3')
  }
}
const envConfig = _.get({
  development: {
    db: {
      logging: console.log
    }
  },
  production: {
    db: {
      logging: () => {}
    }
  }
}, _.get(process.env, 'NODE_ENV', 'development'), {})

module.exports = _.defaultsDeep({}, baseConfig, userConfig, defaultConfig, envConfig)

