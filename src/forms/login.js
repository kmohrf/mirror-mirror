import forms, { fields } from 'forms'
import layout from './_layout'

export default () => {
  const form = forms.create({
    username: fields.email({ required: true, label: 'Email' }),
    password: fields.password({ required: true })
  })

  layout(form)

  return form
}
