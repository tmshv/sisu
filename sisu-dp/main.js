const fs = require('fs')
const dotenv = require('dotenv')
const { MongoClient } = require('mongodb')
const createApp = require('./app')
const loop = require('./loop')

if (fs.existsSync('.env')) {
    console.log('using environment variables from .env file')

    dotenv.config({
        path: '.env'
    })
}

async function getDb(mongoUri, dbName) {
    try {
        const client = await MongoClient.connect(mongoUri, {
            useNewUrlParser: true,
        })

        return client.db(dbName)
    } catch (error) {
        process.exit(1)
    }
}

(async () => {
    const mongoUri = process.env.MONGODB_URI
    const dbName = process.env.DB_NAME
    const port = process.env.PORT
    const secret = process.env.SECRET
    const loopSleep = process.env.LOOP_SLEEP
    const updateDelay = process.env.UPDATE_DELAY

    const db = await getDb(mongoUri, dbName)

    const cancelLoop = loop(db, loopSleep, updateDelay)
    await createApp(db, {
        port,
        secret,
    })
})()
