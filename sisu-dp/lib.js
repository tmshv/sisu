const { createClient } = require('webdav')
const shorthash = require('shorthash')
const uuidv4 = require('uuid/v4')

function isWebdavDataProvider(dp) {
    return dp.type === 'webdav'
}

function createShortHash(input) {
    return shorthash.unique(input);
}

function createFileId(prefix, filename) {
    const sample = `${prefix}:${filename}`

    return createShortHash(sample);
}

async function getFlat(client, entryPoint) {
    const result = []
    let queue = [
        entryPoint
    ]

    while (true) {
        if (!queue.length) {
            break
        }

        const dir = queue.shift()

        const items = await client.getDirectoryContents(dir)
        const dirs = items
            .filter(x => x.type === 'directory')
            .map(x => x.filename)
        queue = [...queue, ...dirs]

        for (const x of items) {
            result.push(x)
        }
    }

    return result
}

function fixMime(mime) {
    if (!mime) {
        return 'application/octet-stream'
    }

    return mime
}

function createFile(scanId, dataProviderId, webdavFile) {
    const filename = webdavFile.filename
    const fileId = createFileId(dataProviderId, filename)

    return {
        filename,
        fileId,
        scanId,
        dataProviderId,
        lastModified: new Date(webdavFile.lastmod),
        size: webdavFile.size,
        revision: webdavFile.etag,
        type: fixMime(webdavFile.mime),
    }
}

function isMatch(dp, file) {
    return true
}

function createWebdavClient(dp) {
    return createClient(dp.options.host, {
        username: dp.options.auth.username,
        password: dp.options.auth.password,
    });
}

exports.createReadStream = async (dp, filename) => {
    if (!isWebdavDataProvider(dp)) {
        console.error(`Data provider ${dp.name} is not WebDAV`)

        return null
    }

    const client = createWebdavClient(dp)

    return client
        .createReadStream(filename)
}

exports.getFlat = async dp => {
    // {
    //     filename: '/UNIT4',
    //     basename: 'UNIT4',
    //     lastmod: 'Fri, 08 Feb 2019 13:44:08 GMT',
    //     size: 0,
    //     type: 'directory',
    //     etag: '100-308-5816227408600',
    // }

    // {
    //     filename: '/UNIT4/RU ... /Chirch square_green_01.jpg',
    //     basename: 'Chirch square_green_01.jpg',
    //     lastmod: 'Sun, 08 Jul 2018 21:17:41 GMT',
    //     size: 1568217,
    //     type: 'file',
    //     etag: '17130d-17edd9-570836d643546',
    //     mime: 'image/jpeg',
    // }

    const dataProviderId = dp._id

    if (!isWebdavDataProvider(dp)) {
        console.error(`Data provider ${dp.name} is not WebDAV`)

        return null
    }

    const client = createWebdavClient(dp)
    const scanId = uuidv4()

    const result = await getFlat(client, dp.options.baseDir)
    const files = result
        .filter(x => x.type === 'file')
        .map(x => createFile(scanId, dataProviderId, x))
        .filter(x => isMatch(dp, x))

    return {
        files,
        scanId,
    }
}
