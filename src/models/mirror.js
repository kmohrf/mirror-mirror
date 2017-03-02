import Sequelize from 'sequelize'

export default function (sequelize, Repository) {
  const Mirror = sequelize.define('mirror', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: Sequelize.STRING },
    uuid: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4 }
  })

  Mirror.belongsTo(Repository, { as: 'sourceRepository' })
  Mirror.belongsTo(Repository, { as: 'targetRepository' })

  Mirror.describe = function () {
    return {
      name: 'Mirrors',
      singleName: 'Mirror',
      keys: {
        name: 'Name'
      }
    }
  }

  return Mirror
}
