import Twig from 'twig'
import moment from 'moment'

Twig.extendFilter('duration', (time, conversion = 'humanize') => {
  const mTime = moment.duration(time)
  return mTime[conversion]()
})

Twig.extendFilter('calendar', time => {
  return moment(time).calendar()
})

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
