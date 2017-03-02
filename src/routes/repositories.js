import { partial } from 'lodash'
import { list, createListHandler } from '../util/view'
import { repositoryForm } from '../forms'
import { formSubmit, formError, allLost, createUserList } from '../util/forms'
import { getOrCreate } from '../util/models'
import { authorizeResource } from '../util/security'

const userSSHKeys = async(persistence, user) => createUserList(persistence.models.SSHKey, user)

async function repositoryEditHandler (Model, persistence, ctx) {
  const id = ctx.params.id
  const model = await getOrCreate(Model, id)
  const method = ctx.request.method.toLowerCase()
  const accessKeys = await userSSHKeys(persistence, ctx.state.user)
  const form = repositoryForm(accessKeys)

  if (method === 'get') {
    return ctx.render('edit', {
      description: Model.describe(),
      form: form.bind(model.toJSON()).toHTML()
    })
  } else {
    return await formSubmit(form, ctx.request.body)
            .then(async (form) => {
              const data = Object.assign(form.data, { userId: ctx.state.user.id })
              if (isNaN(data.accessKeyId)) data.accessKeyId = null
              model.set(data)
              await model.save()
              return ctx.redirect(`/app/repositories#id-${model.id}`)
            }, formError(ctx, 'edit'))
            .catch(allLost(ctx))
  }
}

export default function (router, container) {
  const persistence = container.get('persistence.manager')
  const { Repository } = persistence.models

  const editRepositories = partial(repositoryEditHandler, Repository, persistence)
  const authorizerRepository = authorizeResource(Repository)

  router.get('/app/repositories', createListHandler(persistence, list('repositories', 'Repository')))
  router.get('/app/repositories/:id', authorizerRepository, editRepositories)
  router.post('/app/repositories/:id', authorizerRepository, editRepositories)
}
