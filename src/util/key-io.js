import { readFile, writeFile, unlink } from 'fs'
import { defaults } from 'lodash'
import tmp from 'tmp'
import Q from 'q'
import spawn from './spawn'

tmp.setGracefulCleanup()

const fileOpts = { encoding: 'utf-8' }

// io helpers
const rm = file => Q.nfcall(unlink, file)
const read = (file, opts = {}) => Q.nfcall(readFile, file, defaults({}, opts, fileOpts))
const write = (file, content, opts = {}) => Q.nfcall(writeFile, file, content, defaults({}, opts, fileOpts))

const readFingerprint = async publicKeyFile => {
  const output = await spawn('ssh-keygen', ['-l', '-f', publicKeyFile])
  return output.split(' ')[1]
}

export default function KeyFileIO (targetDirectory, keySize) {
  function storeTemp (key, callback) {
    return new Promise((resolve, reject) => {
      tmp.file({ dir: targetDirectory }, async function (err, path, fd, cleanup) {
        if (err) reject(err)
        let result

        try {
          await write(path, key.privateKey, { mode: 0o600 })
          result = await callback(path)
        } catch (e) {
          reject(e)
        } finally {
          cleanup()
          resolve(result)
        }
      })
    })
  }

  function getPublicKey (key) {
    return new Promise(resolve => {
      storeTemp(key, async function (keyFile) {
        const output = await spawn('ssh-keygen', ['-y', '-f', keyFile])
        resolve(output)
      })
    })
  }

  function getFingerprint (key) {
    return new Promise((resolve, reject) => {
      tmp.file({ dir: targetDirectory }, async function (err, publicKeyPath, fd, cleanup) {
        if (err) reject(err)

        try {
          const publicKey = await getPublicKey(key)
          await write(publicKeyPath, publicKey)
          resolve(await readFingerprint(publicKeyPath))
        } catch (e) {
          reject(e)
        } finally {
          cleanup()
        }
      })
    })
  }

  function generate () {
    return new Promise((resolve, reject) => {
      tmp.tmpName({ dir: targetDirectory }, async function (err, privateKeyPath, fd, cleanup) {
        if (err) reject(err)
        const publicKeyPath = `${privateKeyPath}.pub`

        try {
          await spawn('ssh-keygen', ['-q', '-N', '', '-b', keySize, '-f', privateKeyPath])
          const privateKey = await read(privateKeyPath)
          const publicKey = await read(publicKeyPath)
          resolve({ privateKey, publicKey })
        } catch (e) {
          reject(e)
        } finally {
          await rm(privateKeyPath)
          await rm(publicKeyPath)
        }
      })
    })
  }

  return { storeTemp, generate, getFingerprint, getPublicKey }
}
