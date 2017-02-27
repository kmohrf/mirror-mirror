import Sequelize from 'sequelize'

export default function (sequelize) {
  const PrivateKey = sequelize.define('private_key', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    name: Sequelize.STRING,
    content: Sequelize.TEXT
  })

  PrivateKey.Instance.prototype.toString = function () {
    return this.name
  }

  PrivateKey.describe = function () {
    return {
      name: 'Private Keys',
      singleName: 'Private Key',
      keys: {
        name: 'Name'
      }
    }
  }

  return PrivateKey
}
