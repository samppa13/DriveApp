import mongoose, { Schema } from 'mongoose'
import { DocumentModel, IDocument } from './Document'

interface ITextDocument extends IDocument {
    type: 'TextDocument'
    text: string
}

const textDocumentSchema: Schema = new Schema({
    text: {
        type: String,
        default: ''
    }
})

const TextDocumentModel: mongoose.Model<ITextDocument> = DocumentModel.discriminator<ITextDocument>('TextDocument', textDocumentSchema)

export { TextDocumentModel, ITextDocument }
