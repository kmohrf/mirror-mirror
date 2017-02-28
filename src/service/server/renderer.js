import Twig from 'twig'

function path(path, options) {
  return new Promise((resolve, reject) => {
    return Twig.renderFile(path, options, (err, html) => {
      if (err) {
        reject(err)
      } else {
        resolve(html)
      }
    })
  })
}

export default path
