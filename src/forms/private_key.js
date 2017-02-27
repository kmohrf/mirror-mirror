import forms, { fields, widgets } from 'forms'
import layout from './_layout'

export default () => {
  const form = forms.create({
    name: fields.string({ required: true }),
    content: fields.string({ required: true, widget: widgets.textarea({ rows: 6 }) })
  })

  layout(form)

  return form
}
