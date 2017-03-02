import Persistence from '../util/persistence'
import SSHKey from '../models/ssh-key'
import Repository from '../models/repository'
import Mirror from '../models/mirror'
import Synchronization from '../models/synchronization'
import User from '../models/user'

export default function (config, encoder, keyIO) {
  const persistence = Persistence()
  const models = persistence.models

  persistence.connect(config)

  models.SSHKey = SSHKey(persistence.adapter, keyIO)
  models.Repository = Repository(persistence.adapter, models.SSHKey)
  models.Mirror = Mirror(persistence.adapter, models.Repository)
  models.Synchronization = Synchronization(persistence.adapter, models.Mirror)
  models.User = User(persistence.adapter, encoder, [
    models.SSHKey,
    models.Repository,
    models.Mirror,
    models.Synchronization
  ])

  persistence.start()

  return persistence
}
