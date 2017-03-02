export function list (slug, modelName) {
  return async function loadList (persistence, user) {
    const Model = persistence.models[modelName]
    const models = await Model.findAll({ where: { userId: user.id } })
    return Object.assign(Model.describe(), { slug, items: models })
  }
}

export function createListHandler (persistence, loader, template = 'list', extensions = {}) {
  return async function (ctx) {
    const data = await loader(persistence, ctx.state.user)
    await ctx.render(template, { list: data, request: ctx.request, extensions })
  }
}
