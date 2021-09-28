'use-strict'
const mongoose = require('mongoose')

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })

        console.log(`[Database] Successfully connected : ${conn.connection.host}`)
    } catch (err) {
        console.error('[Database] Failed to connect : \n\n' + err)
        process.exit(1)
    }

}

module.exports = connectDB