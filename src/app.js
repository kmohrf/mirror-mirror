import { defaultsDeep as defaults } from 'lodash'
import Container from './container'

const defaultConfig = {
  server: {
    port: 3000,
    views: `${__dirname}/views`,
    session: `${process.cwd()}/run/sessions.json`,
    staticFiles: {
      '/static': `${__dirname}/../static`,
      '/static/css': `${__dirname}/../node_modules/bootswatch/paper`,
      '/static/js': `${__dirname}/../node_modules/delegate/dist`
    }
  },
  repositoryDir: `${process.cwd()}/run/repositories`,
  password: { iterations: 5000, algorithm: 'sha512' },
  db: {
    url: `sqlite://`,
    options: {
      pool: {max: 5, min: 0, idle: 10000},
      storage: `${process.cwd()}/run/mirror-mirror.sqlite3`
    }
  }
}

export default options => {
  const container = Container()
  const config = defaults(options.config, defaultConfig)
  container.load(config)
  container.compile()
  return {
    container,
    start: container.services.server.app.start
  }
}
