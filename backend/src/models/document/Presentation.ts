import mongoose, { Schema } from 'mongoose'
import { DocumentModel, IDocument } from './Document'

interface ISlide {
    title: string
    bullets: string[]
}

interface IPresentationDocument extends IDocument {
    type: 'PresentationDocument'
    slides: ISlide[]
}

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

const PresentationDocumentModel: mongoose.Model<IPresentationDocument> = DocumentModel.discriminator<IPresentationDocument>('PresentationDocument', presentationDocumentSchema)

export { PresentationDocumentModel, IPresentationDocument }
