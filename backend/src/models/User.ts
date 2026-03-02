import mongoose, { Document, Schema } from 'mongoose'

// Define the interface for a User
interface IUser extends Document {
    username: string
    password: string
    profileImage: string | null
}

// Define the schema for a User
const UserSchema: Schema = new Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    profileImage: {
        type: String,
        default: null
    }
})

// Define User model
const User: mongoose.Model<IUser> = mongoose.model<IUser>('User', UserSchema)

export {User, IUser}
