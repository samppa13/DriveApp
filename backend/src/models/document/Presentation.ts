import mongoose, { Schema } from 'mongoose'
import { DocumentModel, IDocument } from './Document'

// Define the interface for a Slide
interface ISlide {
    title: string
    bullets: string[]
}

// Define the interface for a PresentationDocument
interface IPresentationDocument extends IDocument {
    type: 'PresentationDocument'
    slides: ISlide[]
}

// Define the schema for a PresentationDocument
const presentationDocumentSchema: Schema = new Schema({
    slides: [{
        title: {
            type: String,
            required: true
        },
        bullets: {
            type: [String],
            default: []
        }
    }]
})

// Define PresentationDocument model using discriminator
const PresentationDocumentModel: mongoose.Model<IPresentationDocument> = DocumentModel.discriminator<IPresentationDocument>('PresentationDocument', presentationDocumentSchema)

export { PresentationDocumentModel, IPresentationDocument }
