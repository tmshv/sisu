const Koa = require('koa')
const logger = require('koa-logger')
const createRouter = require('./router')

function isAuthorized(secret) {
    return async (ctx, next) => {
        const token = ctx.headers['x-token']
        
        if (token !== secret) {
            ctx.status = 403
            ctx.body = {
                error: 'Forbidden',
            }
        } else {
            await next()
        }
    }
}

module.exports = function createApp(db, { port, secret }) {
    const app = new Koa()
    const router = createRouter(db)

    // Development logging
    app.use(logger())
    app.use(isAuthorized(secret))

    // Add routes and response to the OPTIONS requests
    app.use(router.routes()).use(router.allowedMethods())

    return new Promise(resolve => {
        app.listen(port, () => {
            console.log(`Server running on port ${port}`)

            resolve(app)
        })
    })
}