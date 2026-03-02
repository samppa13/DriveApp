import mongoose, { Schema } from 'mongoose'
import { DocumentModel, IDocument } from './Document'

// Define the interface for a TextDocument
interface ITextDocument extends IDocument {
    type: 'TextDocument'
    text: string
}

// Define the schema for a TextDocument
const textDocumentSchema: Schema = new Schema({
    text: {
        type: String,
        default: ''
    }
})

// Define TextDocument model using discriminator
const TextDocumentModel: mongoose.Model<ITextDocument> = DocumentModel.discriminator<ITextDocument>('TextDocument', textDocumentSchema)

export { TextDocumentModel, ITextDocument }
