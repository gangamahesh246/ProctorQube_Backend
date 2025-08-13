const mongoose = require('mongoose');

const connectDB = async () => {
    try{
        const connection = await mongoose.connect(process.env.MONGO_URL, {
            useNewUrlParser: true
        })

        console.log(`MongoDB connected: ${connection.connection.host}`)
    }
    catch(err){
        console.log(err)
        process.exit(1)
    }
}

module.exports = connectDB;