import passport from 'koa-passport'
import LocalStrategy from 'passport-local'

function Serializer (User) {
  function serialize (user, done) {
    done(null, user.id)
    return user.id
  }

  function unserialize (id, done) {
    return User
            .findOne({ where: { id: id } })
            .then((user) => {
              user ? done(null, user) : done(null, false)
              return Promise.resolve(user)
            })
  }

  return { serialize, unserialize }
}

export default function (authorize, User) {
  const serializer = Serializer(User)
  const strategy = new LocalStrategy((email, password, done) => {
    authorize(email, password)
            .then(user => done(null, user))
            .catch(message => done(null, false, { message }))
  })

  passport.use(strategy)
  passport.serializeUser(serializer.serialize)
  passport.deserializeUser(serializer.unserialize)

  return strategy
}
