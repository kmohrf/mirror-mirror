import passwordEncoder from './service/security/password-encoder'
import authorize from './service/security/authorize'
import persistence from './service/persistence'
import sessions from './service/server/sessions'
import firewall from './service/server/firewall'
import router from './service/server/router'
import app from './service/server/app'
import { merge, set } from 'lodash'

function Container () {
  const config = {}
  const services = {}
  const iface = {}

  function load (options) {
    merge(config, options)
  }

  function register (name, service) {
    set(services, name, service)
    return service
  }

  function compile () {
    const encoder = passwordEncoder(config.password.iterations, config.password.algorithm)
    const persistenceManager = persistence(config.db, encoder)
    const authorizer = authorize(persistenceManager.models.User, encoder)
    const sessionStorage = sessions(config.server.session)
    const routerInstance = router(persistenceManager, config.repositoryDir)

    register('security.passwordEncoder', encoder)
    register('persistence.manager', persistenceManager)
    register('security.authorize', authorizer)
    register('server.session_store', sessionStorage)
    register('server.firewall', firewall(authorizer, persistenceManager.models.User))
    register('server.router', routerInstance)
    register('server.app', app(config.server, routerInstance, sessionStorage, persistenceManager.models.User))
  }

  Container.instance = iface

  return Object.assign(iface, { load, register, compile, services })
}

Container.get = function () {
  return Container.instance
}

export default Container
