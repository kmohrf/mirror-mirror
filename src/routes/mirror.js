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

      try {
        await sync(mirror, repositoryDir)
        syncModel.wasSuccessful = true
        ctx.body = 'OK'
      } catch (e) {
        syncModel.wasSuccessful = false
        syncModel.error = e.message.trim()
        console.error(e.stack)
        ctx.body = 'FAIL'
      } finally {
        syncModel.finishedOn = new Date()
        await syncModel.save()
      }
    } else {
      ctx.body = 'FAIL'
    }
  })
}
