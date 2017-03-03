(function (delegate) {
  'use strict'

  const target = document.getElementById('error-target')
  const container = document.getElementById('error-container')

  delegate(document, '[data-purpose="show-log"]', 'click', function (e) {
    const contentId = 'item-' + e.target.dataset.id + '-error'
    target.innerHTML = document.getElementById(contentId).innerHTML
    container.classList.remove('hidden')
    window.scrollTo(0, 0)
  })

  delegate(document, '[data-purpose="hide-log"]', 'click', function () {
    container.classList.add('hidden')
  })
})(window.delegate)
