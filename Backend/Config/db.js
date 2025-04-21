const mongoose = require('mongoose');
const colors = require('colors');
const ConnectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`Connected to MongoDB: ${conn.connection.host}`.green.bold);
    } catch (error) {
        console.error(`Error connecting to MongoDB: ${error.message}`.red.bold);
        process.exit(1);
    }
}

module.exports = ConnectDB;