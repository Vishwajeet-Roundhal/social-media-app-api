const mongoose = require('mongoose')

URI = "<mongodb uri>"

const connectDB = async () => {
    try {
        await mongoose.connect(URI);
        console.log("connected to database");
    } catch (error) {
        console.error(error,"error getting data")
    }
}

module.exports = connectDB
