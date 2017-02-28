export default function (router, persistence) {
  const { Synchronization, Mirror } = persistence.models

  router.get('/app/synchronizations', async function(ctx) {
    const syncs = await Synchronization.findAll({
      where: { userId: ctx.state.user.id },
      order: [
        ['startedOn', 'DESC']
      ],
      include: { model: Mirror, as: 'mirror' },
    })

    return ctx.render('synchronizations', { syncs })
  })
}
