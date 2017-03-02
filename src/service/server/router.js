import fs from 'fs'
import path from 'path'
import Router from 'koa-better-router'

const routesPath = path.resolve(`${__dirname}/../../routes`)

export default container => {
  const router = Router().loadMethods()

  router._start = () => {
    fs.readdirSync(routesPath).forEach(file => {
      const modulePath = `${routesPath}/${file}`
      const initializer = require(modulePath).default
      initializer(router, container)
    })
  }

  return router
}
