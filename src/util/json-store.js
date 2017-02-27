import fs from 'fs'
import Q from 'q'
import { has } from 'lodash'

const fallback = (...args) => Promise.resolve({ args })
const serialize = (content) => Promise.resolve(JSON.stringify(content, null, '    '))
const unserialize = (content) => {
  try {
    return Promise.resolve(JSON.parse(content))
  } catch (e) {
    return Promise.reject(e)
  }
}

// todo implement ttl
function _get (id) {
  return (sessions) => {
    return new Promise(resolve => {
      if (has(sessions, id)) {
        const session = sessions[id]
        resolve(session.data)
      } else {
        resolve({})
      }
    })
  }
}

function _set (id, data, ttl) {
  return (sessions) => {
    return new Promise(resolve => {
      sessions[id] = { data, ttl }
      resolve(sessions)
    })
  }
}

function _destroy (id) {
  return (sessions) => {
    return new Promise(resolve => {
      delete sessions[id]
      resolve(sessions)
    })
  }
}

function Store (file) {
  function read () {
    return Q.nfcall(fs.readFile, file, 'utf-8')
            .then(unserialize, fallback)
  }

  function write (sessions) {
    return serialize(sessions)
            .then((data) => Q.nfcall(fs.writeFile, file, data, 'utf-8'))
  }

  function get (id) {
    return read()
            .then(_get(id))
  }

  function set (id, session, ttl) {
    return read()
            .then(_set(id, session, ttl))
            .then(write)
  }

  function destroy (id) {
    return read()
            .then(_destroy(id))
            .then(write)
  }

  return { get, set, destroy }
}

export default Store
