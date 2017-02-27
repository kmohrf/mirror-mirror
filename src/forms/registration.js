import forms, { fields, validators } from 'forms'
import layout from './_layout'

export default () => {
  const form = forms.create({
    name: fields.string({ required: true }),
    email: fields.email({ required: true }),
    password: fields.password({ required: true }),
    password_confirm: fields.password({
      required: true,
      validators: [validators.matchField('password')],
      label: 'Password (repeat for confirmation)'
    })
  })

  layout(form)

  return form
}
