import mongoose, { Schema } from 'mongoose'
import { DocumentModel, IDocument } from './Document'

interface IImage extends IDocument {
    type: 'Image'
    path: string
    originalName: string
}

const imageSchema: Schema = new Schema({
    path: {
        type: String,
        required: true
    },
    originalName: {
        type: String,
        required: true
    }
})

const ImageModel: mongoose.Model<IImage> = DocumentModel.discriminator<IImage>('Image', imageSchema)

export { ImageModel, IImage }
