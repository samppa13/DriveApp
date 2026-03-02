import mongoose, { Document, Schema } from 'mongoose'

// Allowed document types
type DocumentType = 'TextDocument' | 'PresentationDocument' | 'SpreadsheetDocument' | 'Image'

// Interface for document lock
interface ILock {
    user: mongoose.Types.ObjectId
    lockTime: Date
}

// Interface for Document
interface IDocument extends Document {
    name: string
    type: DocumentType
    user: mongoose.Types.ObjectId
    permissions: mongoose.Types.ObjectId[]
    viewToken: string | null
    lock: ILock | null
    isDeleted: boolean
}

// Base options for schema (discriminator key for inheritance, timestamps)
const baseOptions = {
    discriminatorKey: 'type',
    timestamps: true
}

// Define the Mongoose schema for a Document
const documentSchema: Schema = new Schema(
    {
        name: { type: String, required: true },
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        permissions: { type: [mongoose.Schema.Types.ObjectId], ref: 'User', default: [] },
        viewToken: { type: String, default: null },
        lock: {
            type: {
                user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
                lockTime: { type: Date, required: true }
            },
            default: null
        },
        type: { 
            type: String, 
            required: true, 
            enum: ['TextDocument', 'PresentationDocument', 'SpreadsheetDocument', 'Image'] 
        },
        isDeleted: { type: Boolean, default: false }
    },
    baseOptions
)

// Create Mongoose model for Document
const DocumentModel: mongoose.Model<IDocument> = mongoose.model<IDocument>('Document', documentSchema)

// Export the model and interface
export { DocumentModel, IDocument }
