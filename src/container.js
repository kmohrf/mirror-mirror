import KeyIO from './util/key-io'
import MirrorControl from './util/mirror'
import passwordEncoder from './service/security/password-encoder'
import authorize from './service/security/authorize'
import persistence from './service/persistence'
import sessions from './service/server/sessions'
import firewall from './service/server/firewall'
import router from './service/server/router'
import renderer from './service/server/renderer'
import app from './service/server/app'
import { merge, set, get as _get } from 'lodash'

function Container () {
  const config = {}
  const services = {}
  const iface = {}
  let isCompiled = false

  function load (options) {
    merge(config, options)
  }

  function register (name, service) {
    set(services, name, service)
    return service
  }

  function compile () {
    if (isCompiled) return

    isCompiled = true

    const keyIO = KeyIO(config.repositoryDir, config.sshKeySize)
    const encoder = passwordEncoder(config.password.iterations, config.password.algorithm)
    const persistenceManager = persistence(config.db, encoder, keyIO)
    const authorizer = authorize(persistenceManager.models.User, encoder)
    const sessionStorage = sessions(config.server.session)
    const routerInstance = router(iface)
    const templateRenderer = renderer(config.twig)
    const { User } = persistenceManager.models

    register('security.passwordEncoder', encoder)
    register('persistence.manager', persistenceManager)
    register('security.authorize', authorizer)
    register('server.sessionStore', sessionStorage)
    register('server.firewall', firewall(authorizer, User))
    register('server.router', routerInstance)
    register('server.app', app(config.server, routerInstance, sessionStorage, templateRenderer, User))
    register('security.keyIO', keyIO)
    register('mirror.control', MirrorControl(config.repositoryDir, keyIO))
  }

  function get (name) {
    return _get(services, name)
  }

  Container.instance = iface

  return Object.assign(iface, { load, register, compile, get })
}

Container.get = function () {
  return Container.instance
}

export default Container
