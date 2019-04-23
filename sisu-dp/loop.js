const { findDataProviders, insertFiles, updateDataProviderScanId, deleteOldFiles } = require('./data')
const { getFlat } = require('./lib')

async function sleep(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms)
    })
}

async function loopDataProvider(db, dataProvider) {
    const dip = dataProvider._id
    const time = new Date()

    // get new files
    const {scanId, files} = await getFlat(dataProvider)

    if (files.length) {
        // insert files in collection
        await insertFiles(db, files)
    }

    // replace data provider scan id
    await updateDataProviderScanId(db, dip, scanId, time)

    // remove files with old scan id
    await deleteOldFiles(db, dip, scanId)
}

module.exports = async (db, sleepMs, scanDelayMs) => {
    let active = true

    while (active) {
        const currentTime = (new Date()).getTime()
        const dps = await findDataProviders(db)

        for (const dataProvider of dps) {
            let skip = false

            if (dataProvider.scanTime) {
                const delta = currentTime - dataProvider.scanTime.getTime()                
                
                skip = delta < scanDelayMs
            }

            if (skip) {
                console.log('Skip updating data provider', dataProvider._id)
                continue
            }

            console.log('Updating data provider', dataProvider._id)

            await loopDataProvider(db, dataProvider)
        }

        await sleep(sleepMs)
    }

    return () => {
        active = false
    }
}
