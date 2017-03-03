(function (delegate, axios, Push) {
  'use strict'

  function push (title, options) {
    return Push.create(title, Object.assign({
      serviceWorker: '/static/js/pushjs/serviceWorker.js',
      icon: {
        x16: '/static/img/logo_16.png',
        x32: '/static/img/logo_32.png'
      }
    }, options))
  }

  delegate(document, '[data-purpose="sync"]', 'click', function (e) {
    const url = e.target.dataset.url
    const name = e.target.dataset.name

    push('Syncing mirror', {
      body: 'The sync progress for mirror ' + name + ' has begun',
      timeout: 3000
    })

    axios.post(url)
      .then(function () {
        push('Synchronization complete', {
          body: 'The sync progress for mirror ' + name + ' was finished successfully',
          timeout: 3000
        })
      }, function () {
        push('Synchronization failed', {
          body: 'The sync progress for mirror ' + name + ' failed. See the synchronization page for details.'
        })
      })
  })
})(window.delegate, window.axios, window.Push)
