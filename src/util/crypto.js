import crypto from 'crypto'
import { range } from 'lodash'

function hash (password, salt, iterations, algorithm = 'sha512', outputEncoding = 'hex') {
  const salted = `${password}{${salt}}`
  const hash = range(0, iterations).reduce((prevHash) => {
    return crypto.createHash(algorithm).update(prevHash.digest('binary') + salted)
  }, crypto.createHash(algorithm).update(salted, 'utf-8'))

  return hash.digest(outputEncoding)
}

hash.factory = function (iterations, algorithm = 'sha512', outputEncoding = 'hex') {
  return (password, salt) => hash(password, salt, iterations, algorithm, outputEncoding)
}

export { hash }
