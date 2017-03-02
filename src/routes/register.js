import { formError, allLost, formSubmit } from '../util/forms'
import { registrationForm } from '../forms'

async function registrationHandler (Model, ctx) {
  const method = ctx.request.method.toLowerCase()
  const form = registrationForm()

  if (method === 'get') {
    return ctx.render('register', {
      form: form.toHTML()
    })
  } else {
    return await formSubmit(form, ctx.request.body)
            .then(async (form) => {
              await Model.create(form.data)
              return ctx.redirect(`/login`)
            }, formError(ctx, 'register'))
            .catch(allLost(ctx, '/'))
  }
}

export default function (router, container) {
  const handler = registrationHandler.bind(null, container.get('persistence.manager').models.User)
  router.get('/register', handler)
  router.post('/register', handler)
}
