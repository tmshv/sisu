const Router = require('koa-router')
const { findDataProviderById, findFilesByScanId, findFileByFileId } = require('./data')
const { createReadStream } = require('./lib')

function error(message) {
    return {
        error: {
            message,
        }
    }
}

module.exports = function createRouter(db) {
    const getDataProviderId = ctx => ctx.params.dataProviderId
    const getFileId = ctx => ctx.params.fileId
    const router = new Router()

    router.get('/providers/:dataProviderId', async (ctx) => {
        const resource = await findDataProviderById(db, getDataProviderId(ctx))

        if (!resource) {
            ctx.status = 404
            ctx.body = error('Not found')

            return
        }

        ctx.body = resource
    })

    router.get('/providers/:dataProviderId/files/metadata', async (ctx) => {
        const dataProvider = await findDataProviderById(db, getDataProviderId(ctx))

        if (!dataProvider) {
            ctx.status = 404
            ctx.body = error('Not found')

            return
        }

        const scanId = dataProvider.scanId
        const files = await findFilesByScanId(db, scanId)

        ctx.body = files
    })

    router.get('/files/:fileId/metadata', async (ctx) => {
        const file = await findFileByFileId(db, getFileId(ctx))

        if (!file) {
            ctx.status = 404
            ctx.body = error('Not found')

            return
        }

        ctx.body = file
    })

    router.get('/files/:fileId/content', async (ctx) => {
        const file = await findFileByFileId(db, getFileId(ctx))

        if (!file) {
            ctx.status = 404
            ctx.body = ctx.body = error('Not found')

            return
        }

        const dataProvider = await findDataProviderById(db, file.dataProviderId)
        const stream = await createReadStream(dataProvider, file.filename)

        if (!stream) {
            ctx.status = 404
            ctx.body = error('File stream not found')

            return
        }

        ctx.type = file.type
        ctx.body = stream
    })

    return router
}