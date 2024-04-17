const mongoose = require('mongoose')

URI = "mongodb+srv://vishwa:oRYlsuuP9QrRyJhE@socialdbcluster.3bfvguk.mongodb.net/?retryWrites=true&w=majority&appName=SocialDBCluster"

const connectDB = async () => {
    try {
        await mongoose.connect(URI);
        console.log("connected to database");
    } catch (error) {
        console.error(error,"error getting data")
    }
}

module.exports = connectDB
