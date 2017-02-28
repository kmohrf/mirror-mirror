import { sync } from '../util/mirror'

export default function (router, persistence, repositoryDir) {
  const { models } = persistence

  router.post('/mirror/:uuid', async function (ctx) {
    const mirror = await models.Mirror.findOne({
      where: {uuid: ctx.params.uuid},
      include: [
        { model: models.Repository, as: 'sourceRepository' },
        { model: models.Repository, as: 'targetRepository' }
      ]
    })

    if (mirror) {
      const syncModel = models.Synchronization.build({
        mirrorId: mirror.id,
        sourceUrl: mirror.sourceRepository.url,
        targetUrl: mirror.targetRepository.url,
        startedOn: new Date(),
        userId: mirror.userId
      })
      syncModel.wasSuccessful = !!await sync(mirror, repositoryDir)
      syncModel.finishedOn = new Date()
      await syncModel.save()
      ctx.body = 'OK'
    } else {
      ctx.body = 'FAIL'
    }
  })
}
