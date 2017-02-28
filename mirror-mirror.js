#!/usr/bin/env babel-node

import path from 'path'
import command from 'commander'
import App from './src/app'

// load app info
const pkg = require('./package.json')

// add error handling
process.on('exit', function () {
  process.reallyExit(process.exitCode)
})

function exitFailure (err) {
  console.error(err.message)
  console.error(err.stack)
  process.exitCode = 1
}

process.on('uncaughtException', exitFailure)
process.on('unhandledRejection', exitFailure)

// configure cli
command
  .version(pkg.version)
  .usage('[options] <url>')
  .option('-v, --verbose', 'verbosity level. repeatable', (v, total) => total + 1, 0)
  .option('-c, --config [file]', 'config file', '')
  .parse(process.argv)

// create config
const config = command.config ? require(path.resolve(command.config)).default : {}

// initialize application
App({ config })
