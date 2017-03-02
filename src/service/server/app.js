import { each } from 'lodash'
import Koa from 'koa'
import Session from 'koa-session-minimal'
import BodyParser from 'koa-bodyparser'
import passport from 'koa-passport'
import View from 'koa-views'
import staticFiles from 'koa-static'
import mount from 'koa-mount'
import { authorizeSession } from '../../util/security'

export default function (config, router, sessionStore, renderer, User) {
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
      twig: renderer
    }
  }))
  app.use(function(ctx, next) {
    renderer.inject({ request: ctx.request })
    return next()
  })

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
      router._start()
      app.listen(config.port)
      console.info(`application started on port ${config.port}`)
    }
  }
}

