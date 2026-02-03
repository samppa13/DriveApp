import mongoose, { Document, Schema } from 'mongoose'

interface ITextDocument extends Document {
    name: string
    text: string
    user: mongoose.Types.ObjectId
    permissions: mongoose.Types.ObjectId[]
}

const textDocumentSchema: Schema = new Schema({
    name: {
        type: String,
        required: true
    },
    text: {
        type: String,
        default: ''
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    permissions: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'User',
        default: []
    }
})

const TextDocument: mongoose.Model<ITextDocument> = mongoose.model<ITextDocument>('TextDocument', textDocumentSchema)

export { TextDocument, ITextDocument }
