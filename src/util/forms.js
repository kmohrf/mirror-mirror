export function formSubmit (form, data) {
  return new Promise((resolve, reject) => {
    form.handle(data, {
      success: form => resolve(form),
      error: form => reject(form)
    })
  })
}

export function createOptions (list) {
  return list.map(item => [item.id, item.toString()])
}

export function defaultEmpty (choices) {
  return [['', '']].concat(choices)
}

export function formError (ctx, view) {
  return form => Promise.resolve(
        ctx.render(view, {
          form: form.toHTML()
        })
    )
}

export function allLost (ctx, fallbackRoute = '/app') {
  return error => {
    console.error(error)
    console.error(ctx)
    return Promise.resolve(ctx.redirect(fallbackRoute))
  }
}

export async function createUserList (Model, user) {
  const models = await Model.findAll({
    where: { userId: user.id }
  })

  return createOptions(models)
}
