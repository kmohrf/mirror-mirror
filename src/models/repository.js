import Sequelize from 'sequelize'

export default function (sequelize, SSHKey) {
  const Repository = sequelize.define('repository', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    name: Sequelize.STRING,
    url: Sequelize.STRING
  })

  Repository.belongsTo(SSHKey, { as: 'accessKey' })

  Repository.Instance.prototype.toString = function () {
    return this.name
  }

  Repository.describe = function () {
    return {
      name: 'Repositories',
      singleName: 'Repository',
      keys: {
        name: 'Name',
        url: 'URL'
      }
    }
  }

  return Repository
}
