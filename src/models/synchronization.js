import Sequelize from 'sequelize'

export default function (sequelize, Mirror) {
  const Synchronization = sequelize.define('synchronization', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    sourceUrl: { type: Sequelize.STRING },
    targetUrl: { type: Sequelize.STRING },
    startedOn: { type: Sequelize.DATE },
    finishedOn: { type: Sequelize.DATE },
    wasSuccessful: { type: Sequelize.BOOLEAN },
    duration: {
      type: new Sequelize.VIRTUAL(),
      get: function () {
        return this.finishedOn.getTime() - this.startedOn.getTime()
      }
    }
  })

  Synchronization.belongsTo(Mirror, { as: 'mirror' })

  Synchronization.describe = function () {
    return {
      name: 'Synchronizations',
      singleName: 'Synchronization'
    }
  }

  return Synchronization
}
