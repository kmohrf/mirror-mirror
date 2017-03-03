import { partial, has } from 'lodash'
import { list, createListHandler } from '../util/view'
import { mirrorForm } from '../forms'
import { formSubmit, formError, allLost, createUserList } from '../util/forms'
import { getOrCreate } from '../util/models'
import { authorizeResource } from '../util/security'

const userRepositories = async(persistence, user) => createUserList(persistence.models.Repository, user)

function mirrorSync (models, mirrorCtl) {
  return async ctx => {
    const uuid = ctx.params.uuid
    const reverse = has(ctx.request.query, 'reverse')
    const mirror = await models.Mirror.findOne({ where: { uuid } })

    if (mirror) {
      const sync = await mirrorCtl.sync(mirror, reverse)

      if (sync.wasSuccessful) {
        ctx.body = 'OK'
      } else {
        ctx.status = 400
        ctx.body = 'FAIL'
      }
    } else {
      ctx.status = 404
      ctx.body = 'NOT FOUND'
    }
  }
}

async function mirrorEditHandler (Model, persistence, ctx) {
  const id = ctx.params.id
  const model = await getOrCreate(Model, id)
  const method = ctx.request.method.toLowerCase()
  const repositories = await userRepositories(persistence, ctx.state.user)
  const form = mirrorForm(repositories)

  if (method === 'get') {
    return ctx.render('edit', {
      description: Model.describe(),
      form: form.bind(model.toJSON()).toHTML()
    })
  } else {
    return await formSubmit(form, ctx.request.body)
      .then(async (form) => {
        const data = Object.assign(form.data, { userId: ctx.state.user.id })
        model.set(data)
        await model.save()
        return ctx.redirect(`/app/mirrors#id-${model.id}`)
      }, formError(ctx, 'edit'))
      .catch(allLost(ctx))
  }
}

export default function (router, container) {
  const mirrorCtl = container.get('mirror.control')
  const persistence = container.get('persistence.manager')
  const { Mirror } = persistence.models

  const editMirrors = partial(mirrorEditHandler, Mirror, persistence)
  const authorizerMirror = authorizeResource(Mirror)

  router.get('/app/mirrors', createListHandler(persistence, list('Mirrors', 'Mirror'), 'list-mirrors', {
    'secondary_content': 'mirrors/list-content.twig'
  }))
  router.get('/app/mirrors/:id', authorizerMirror, editMirrors)
  router.post('/app/mirrors/:id', authorizerMirror, editMirrors)
  router.post('/mirror/:uuid', mirrorSync(persistence.models, mirrorCtl))
}
