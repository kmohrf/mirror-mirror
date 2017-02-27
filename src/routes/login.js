import loginForm from '../forms/login'

export default function (router) {
  router.get('/login', async function (ctx) {
    return await ctx.render('login', {
      form: loginForm().toHTML()
    })
  })
}
