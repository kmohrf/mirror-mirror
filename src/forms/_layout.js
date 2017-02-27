export function horizontal (name, object) {
  if (!Array.isArray(object.widget.classes)) {
    object.widget.classes = []
  }

  if (object.widget.classes.indexOf('form-control') === -1) {
    object.widget.classes.push('form-control')
  }

  const label = object.labelHTML(name)
  const error = object.error ? '<div class="alert alert-error help-block">' + object.error + '</div>' : ''

  let validationclass = object.value && !object.error ? 'has-success' : ''
  validationclass = object.error ? 'has-error' : validationclass

  const widget = object.widget.toHTML(name, object)
  return '<div class="form-group ' + validationclass + '">' + label + widget + error + '</div>'
}

export default function decorate (form, layout = 'horizontal') {
  const layouter = { horizontal }[layout]
  const renderer = form.toHTML
  form.toHTML = function () {
    return renderer.call(this, layouter)
  }
  return form
}
