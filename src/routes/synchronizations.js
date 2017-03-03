export default function (router, container) {
  const { Synchronization } = container.get('persistence.manager').models

  router.get('/app/synchronizations', async function (ctx) {
    const syncs = await Synchronization.findAll({
      where: { userId: ctx.state.user.id },
      order: [
        ['startedOn', 'DESC']
      ]
    })

    return ctx.render('synchronizations', { syncs })
  })
}
