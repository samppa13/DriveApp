import mongoose, { Schema } from 'mongoose'
import { DocumentModel, IDocument } from './Document'

// Define the interface for a Image
interface IImage extends IDocument {
    type: 'Image'
    path: string
    originalName: string
}

// Define the schema for a Image
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

// Define Image model using discriminator from DocumentModel
const ImageModel: mongoose.Model<IImage> = DocumentModel.discriminator<IImage>('Image', imageSchema)

export { ImageModel, IImage }
