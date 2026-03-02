import mongoose, { Connection } from 'mongoose'

// Connect to MongoDB and handle connection errors
const connectDB = () => {
    const mongoDB: string = process.env.MONGO_URI as string
    mongoose.connect(mongoDB)
    mongoose.Promise = Promise
    const db: Connection = mongoose.connection
    db.on('error', console.error.bind(console, 'MongoDB connection error'))
}

export default connectDB
