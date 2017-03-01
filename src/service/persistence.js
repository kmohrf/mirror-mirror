import Persistence from '../util/persistence'
import PrivateKey from '../models/private_key'
import Repository from '../models/repository'
import Mirror from '../models/mirror'
import Synchronization from '../models/synchronization'
import User from '../models/user'

export default function (config, encoder) {
  const persistence = Persistence()
  const models = persistence.models

  persistence.connect(config)

  models.PrivateKey = PrivateKey(persistence.adapter)
  models.Repository = Repository(persistence.adapter, models.PrivateKey)
  models.Mirror = Mirror(persistence.adapter, models.Repository)
  models.Synchronization = Synchronization(persistence.adapter, models.Mirror)
  models.User = User(persistence.adapter, encoder, [
    models.PrivateKey,
    models.Repository,
    models.Mirror,
    models.Synchronization
  ])

  persistence.start()

  return persistence
}
