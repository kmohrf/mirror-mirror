import Router from 'koa-better-router'
import base from '../../routes/base'
import login from '../../routes/login'
import logout from '../../routes/logout'
import register from '../../routes/register'
import list from '../../routes/list'
import edit from '../../routes/edit'
import app from '../../routes/app'
import mirror from '../../routes/mirror'

export default function (persistence, repositoryDir) {
  const router = Router().loadMethods()

    // load routes
  base(router)
  login(router)
  logout(router)
  register(router, persistence)
  list(router, persistence)
  edit(router, persistence)
  app(router, persistence)
  mirror(router, persistence, repositoryDir)

  return router
}
