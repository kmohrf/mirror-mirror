import forms, { fields, widgets } from 'forms'
import layout from './_layout'

export default (repositories) => {
  const form = forms.create({
    name: fields.string({ required: true }),
    sourceRepositoryId: fields.number({
      required: true,
      choices: repositories,
      widget: widgets.select(),
      label: 'Source Repository'
    }),
    targetRepositoryId: fields.number({
      required: true,
      choices: repositories,
      widget: widgets.select(),
      label: 'Target Repository'
    })
  })

  layout(form)

  return form
}
