export default function (router) {
  router.get('/', (ctx) => {
    if (ctx.isAuthenticated()) {
      ctx.redirect('/app')
    } else {
      ctx.redirect('/login')
    }
  })
}
