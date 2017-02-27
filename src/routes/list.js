function list (slug, modelName) {
  return async function loadList (persistence, user) {
    const Model = persistence.models[modelName]
    const models = await Model.findAll({ where: { userId: user.id } })
    return Object.assign(Model.describe(), { slug, items: models })
  }
}

list.loaders = {
  private_keys: list('private_keys', 'PrivateKey'),
  repositories: list('repositories', 'Repository'),
  mirrors: list('mirrors', 'Mirror')
}

function createHandler (persistence, loader) {
  return async function (ctx) {
    const data = await loader(persistence, ctx.state.user)
    await ctx.render('list', { list: data })
  }
}

export default function (router, persistence) {
  router.get('/app/private_keys', createHandler(persistence, list.loaders.private_keys))
  router.get('/app/repositories', createHandler(persistence, list.loaders.repositories))
  router.get('/app/mirrors', createHandler(persistence, list.loaders.mirrors))
}
