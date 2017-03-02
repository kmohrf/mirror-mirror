import Sequelize from 'sequelize'

export default function (sequelize, keyIO) {
  const SSHKey = sequelize.define('ssh_key', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    name: Sequelize.STRING,
    privateKey: Sequelize.TEXT,
    publicKey: Sequelize.TEXT,
    fingerprint: Sequelize.STRING
  })

  SSHKey.hook('beforeCreate', async function storePublicData (key) {
    key.publicKey = await keyIO.getPublicKey(key)
    key.fingerprint = await keyIO.getFingerprint(key)
  })

  SSHKey.Instance.prototype.toString = function () {
    return `${this.name} (${this.fingerprint})`
  }

  SSHKey.describe = function () {
    return {
      name: 'SSH Keys',
      singleName: 'SSH Key',
      keys: {
        name: 'Name',
        fingerprint: 'Fingerprint'
      }
    }
  }

  return SSHKey
}
