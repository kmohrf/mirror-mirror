import Container from './container'
import config from './config'

export default () => {
  const container = Container()
  container.load(config)
  container.compile()

  return {
    container,
    start: container.services.server.app.start
  }
}
