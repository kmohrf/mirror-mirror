export function authorizeSession (User) {
  return async function (ctx, next) {
    const exit = () => ctx.redirect('/')

    if (ctx.request.url.startsWith('/app')) {
      if (!ctx.isAuthenticated) {
        return exit()
      } else {
        const user = await User.findById(ctx.state.user.id)

        if (!user) {
          return exit()
        }
      }
    }

    return next()
  }
}

export function authorizeResource (Model) {
  return async function (ctx, next) {
    const model = await Model.findById(ctx.params.id)

    if (!model || model.userId === ctx.state.user.id) {
      return next()
    } else {
      return ctx.app.emit('error', new Error(403))
    }
  }
}
