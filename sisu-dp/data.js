async function findDataProviderById (db, id) {
    const result = await db.collection('dataproviders')
        .findOne({
            _id: id,
        })

    return result
}

async function findDataProviders (db) {
    const result = await db.collection('dataproviders')
        .find({})
        .toArray()

    return result
}

async function updateDataProviderScanId (db, id, scanId, scanTime) {
    const result = await db.collection('dataproviders')
        .updateOne({ _id: id }, {
            $set: {
                scanId,
                scanTime,
            }
        })

    return result
}

async function findFilesByScanId (db, scanId) {
    const result = await db.collection('files')
        .find({ scanId })
        .toArray()

    return result
}

async function findFilesByFileId (db, fileId) {
    const result = await db.collection('files')
        .find({ fileId })
        .toArray()

    return result
}

async function insertFiles (db, files) {
    await db.collection('files').insertMany(files)

    return []
}

async function deleteOldFiles (db, scanId) {
    await db.collection('files').deleteMany({
        scanId: { $ne: scanId },
    })

    return []
}

async function findFileByFileId (db, fileId) {
    const files = await findFilesByFileId(db, fileId)

    if (files.length === 0) {
        return null
    }

    if (files.length === 1) {
        return files[0]
    }

    const dataProviderId = files[0].dataProviderId
    const dataProvider = await findDataProviderById(db, dataProviderId)
    const scanId = dataProvider.scanId

    return files.find(f => f.scanId === scanId)
}

exports.findDataProviderById = findDataProviderById
exports.findDataProviders = findDataProviders
exports.updateDataProviderScanId = updateDataProviderScanId
exports.findFilesByScanId = findFilesByScanId
exports.findFilesByFileId = findFilesByFileId
exports.insertFiles = insertFiles
exports.deleteOldFiles = deleteOldFiles
exports.findFileByFileId = findFileByFileId
