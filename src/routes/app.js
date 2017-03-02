async function getModelContext (Model, user) {
  return {
    description: Model.describe(),
    count: await Model.count({where: {userId: user.id}})
  }
}

export default function (router, container) {
  const { models } = container.get('persistence.manager')

  router.get('/app', async function (ctx) {
    const user = ctx.state.user

    return ctx.render('app', {
      collections: {
        sshKey: await getModelContext(models.SSHKey, user),
        mirror: await getModelContext(models.Mirror, user),
        repository: await getModelContext(models.Repository, user),
        synchronization: await getModelContext(models.Synchronization, user)
      }
    })
  })
}
