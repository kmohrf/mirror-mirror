import Sequelize from 'sequelize'

export default function (sequelize, Repository) {
  const Mirror = sequelize.define('mirror', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: Sequelize.STRING },
    uuid: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV1 },
    tokenUrl: {
      type: new Sequelize.VIRTUAL(),
      get: function () {
        return `/mirror/${this.uuid}`
      }
    }
  })

  Mirror.belongsTo(Repository, { as: 'sourceRepository' })
  Mirror.belongsTo(Repository, { as: 'targetRepository' })

  Mirror.describe = function () {
    return {
      name: 'Mirrors',
      singleName: 'Mirror',
      keys: {
        name: 'Name',
        tokenUrl: 'Trigger URL'
      }
    }
  }

  return Mirror
}
