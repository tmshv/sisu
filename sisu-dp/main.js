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
    const sec = s => s * 1000
    const min = m => sec(m * 60)

    const mongoUri = process.env.MONGODB_URI
    const dbName = process.env.DB_NAME
    const port = process.env.PORT
    const secret = process.env.SECRET

    const db = await getDb(mongoUri, dbName)

    const cancelLoop = loop(db, sec(10), min(5))
    await createApp(db, {
        port,
        secret,
    })
})()
