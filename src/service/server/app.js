import { each } from 'lodash'
import Koa from 'koa'
import Session from 'koa-session-minimal'
import BodyParser from 'koa-bodyparser'
import passport from 'koa-passport'
import View from 'koa-views'
import staticFiles from 'koa-static'
import mount from 'koa-mount'
import Twig from 'twig'
import { authorizeSession } from '../../util/security'

export default function (config, router, sessionStore, User) {
  const app = new Koa()

    // trust proxies
  app.proxy = true

    // initialize body parser
  app.use(BodyParser())

    // register static files
  each(config.staticFiles, (path, mountPoint) => {
    app.use(mount(mountPoint, staticFiles(path)))
  })

    // initialize session management
  const sessionMiddleware = Session({ key: 'sessID', store: sessionStore })
  sessionMiddleware._name = 'session'
  app.use(sessionMiddleware)

    // setup view
  app.use(View(config.views, {
    extension: 'twig',
    engineSource: {
      twig: function render (path, options) {
        return new Promise((resolve, reject) => {
          Twig.renderFile(path, options, (err, html) => (err && reject(err)) || resolve(html))
        })
      }
    }
  }))

    // enable authentication
  app.use(passport.initialize())
  app.use(passport.session())

    // enable router
  router.post('/login_check', passport.authenticate('local', {
    successRedirect: '/app',
    failureRedirect: '/login'
  }))

    // enable authorization
  app.use(authorizeSession(User))

  const routerMiddleware = router.middleware()
  routerMiddleware._name = 'router'
  app.use(routerMiddleware)

  return {
    start: () => {
      app.listen(config.port)
      console.info(`application started on port ${config.port}`)
    }
  }
}

