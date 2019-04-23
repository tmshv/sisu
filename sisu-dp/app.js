const Koa = require('koa')
const logger = require('koa-logger')
const createRouter = require('./router')

function isAuthorized(secret) {
    const getToken = ctx => {
        if ('x-token' in ctx.headers) {
            return ctx.headers['x-token']
        }

        if (ctx.query.token) {
            return ctx.query.token
        }

        return null
    }
    return async (ctx, next) => {
        const token = getToken(ctx)
        
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