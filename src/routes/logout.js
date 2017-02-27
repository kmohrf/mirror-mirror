export default function (router) {
  router.get('/logout', function (ctx) {
    ctx.logout()
    ctx.redirect('/')
  })
}
