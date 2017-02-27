import Sequelize from 'sequelize'
import Q from 'q'

function Persistence () {
  const models = Object.create(null)
  const iface = {}
  const available = Q.defer()
  let adapter

  function connect (...args) {
    // init sequalize
    adapter = new Sequelize(...args)

    // signal availability
    available.resolve(iface)

    return iface
  }

  function start () {
    return adapter.sync()
      .then(() => Promise.resolve(iface))
  }

  Object.defineProperty(iface, 'adapter', {
    get: () => adapter
  })

  return Object.assign(iface, {
    models,
    connect,
    start,
    available: available.promise
  })
}

export default Persistence
