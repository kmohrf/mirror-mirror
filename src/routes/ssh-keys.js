import { partial } from 'lodash'
import { list, createListHandler } from '../util/view'
import { getOrCreate } from '../util/models'
import { formSubmit, formError, allLost } from '../util/forms'
import { sshKeyForm } from '../forms'
import { authorizeResource } from '../util/security'

async function sshKeyEditHandler (Model, ctx) {
  const id = ctx.params.id
  const model = await getOrCreate(Model, id)
  const method = ctx.request.method.toLowerCase()
  const form = sshKeyForm(model)

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
        return ctx.redirect(`/app/ssh-keys#id-${model.id}`)
      }, formError(ctx, 'edit'))
      .catch(allLost(ctx))
  }
}

function generateKey (keyIO, SSHKey) {
  return async ctx => {
    const keyData = await keyIO.generate()
    const key = SSHKey.build(Object.assign(keyData, {
      name: 'Generated Key',
      userId: ctx.state.user.id
    }))
    await key.save()
    return ctx.redirect('/app/ssh-keys')
  }
}

export default function (router, container) {
  const persistence = container.get('persistence.manager')
  const keyIO = container.get('security.keyIO')
  const { SSHKey } = persistence.models

  const editSSHKeys = partial(sshKeyEditHandler, SSHKey)
  const authorizerSSHKeys = authorizeResource(SSHKey)

  router.post('/app/ssh-keys/generate', generateKey(keyIO, SSHKey))
  router.get('/app/ssh-keys', createListHandler(persistence, list('ssh-keys', 'SSHKey'), 'list-ssh-keys', {
    'secondary_content': 'ssh-keys/list-content.twig'
  }))
  router.get('/app/ssh-keys/:id', authorizerSSHKeys, editSSHKeys)
  router.post('/app/ssh-keys/:id', authorizerSSHKeys, editSSHKeys)
}
