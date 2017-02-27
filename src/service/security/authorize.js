export default function (User, encoder) {
  return function (email, password) {
    return new Promise((resolve, reject) => {
      return User.findOne({ where: { email } })
                .then(user => {
                  if (user && user.password === encoder(password, user.salt)) {
                    resolve(user)
                  } else {
                    reject('Invalid email and/or password')
                  }
                })
    })
  }
}
