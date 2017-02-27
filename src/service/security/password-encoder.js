import { hash } from '../../util/crypto'

export default function (iterations, algorithm) {
  return hash.factory(iterations, algorithm)
}
