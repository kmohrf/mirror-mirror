import { partial } from 'lodash'
import { privateKeyForm, repositoryForm, mirrorForm } from '../forms'
import { formSubmit, formError, allLost, createUserList } from '../util/forms'
import { getOrCreate } from '../util/models'
import { authorizeResource } from '../util/security'

const userPrivateKeys = async(persistence, user) => createUserList(persistence.models.PrivateKey, user)
const userRepositories = async(persistence, user) => createUserList(persistence.models.Repository, user)

async function privateKeyEditHandler (Model, ctx) {
  const id = ctx.params.id
  const model = await getOrCreate(Model, id)
  const method = ctx.request.method.toLowerCase()
  const form = privateKeyForm()

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
              return ctx.redirect(`/app/private_keys#id-${model.id}`)
            }, formError(ctx, 'edit'))
            .catch(allLost(ctx))
  }
}

async function repositoryEditHandler (Model, persistence, ctx) {
  const id = ctx.params.id
  const model = await getOrCreate(Model, id)
  const method = ctx.request.method.toLowerCase()
  const accessKeys = await userPrivateKeys(persistence, ctx.state.user)
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

export default function (router, persistence) {
  const { PrivateKey, Repository, Mirror } = persistence.models

  const editPrivateKeys = partial(privateKeyEditHandler, PrivateKey)
  const editRepositories = partial(repositoryEditHandler, Repository, persistence)
  const editMirrors = partial(mirrorEditHandler, Mirror, persistence)

  const authorizerPrivateKey = authorizeResource(PrivateKey)
  const authorizerRepository = authorizeResource(Repository)
  const authorizerMirror = authorizeResource(Mirror)

  router.get('/app/private_keys/:id', authorizerPrivateKey, editPrivateKeys)
  router.get('/app/repositories/:id', authorizerRepository, editRepositories)
  router.get('/app/mirrors/:id', authorizerMirror, editMirrors)
  router.post('/app/private_keys/:id', authorizerPrivateKey, editPrivateKeys)
  router.post('/app/repositories/:id', authorizerRepository, editRepositories)
  router.post('/app/mirrors/:id', authorizerMirror, editMirrors)
}
