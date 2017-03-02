import forms, { fields, widgets } from 'forms'
import layout from './_layout'

export default (key) => {
  const form = forms.create({
    name: fields.string({ required: true }),
    privateKey: fields.string({
      required: true,
      widget: widgets.textarea({ rows: 6, readonly: !!key.id })
    })
  })

  layout(form)

  return form
}
