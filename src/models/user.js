import Sequelize from 'sequelize'

export default function (sequelize, encoder, userModels) {
  const User = sequelize.define('user', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    name: Sequelize.STRING,
    email: Sequelize.STRING,
    password: {
      type: Sequelize.STRING,
      set: function (password) {
        this.setDataValue('password', encoder(password, this.salt))
      }
    },
    salt: { type: Sequelize.STRING, defaultValue: Sequelize.UUIDV1 }
  })

  for (const model of userModels) {
    User.hasMany(model)
  }

  return User
}
