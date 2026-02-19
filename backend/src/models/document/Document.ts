import mongoose, { Document, Schema } from 'mongoose'

type DocumentType = 'TextDocument' | 'PresentationDocument'

interface ILock {
    user: mongoose.Types.ObjectId
    lockTime: Date
}

interface IDocument extends Document {
    name: string
    type: DocumentType
    user: mongoose.Types.ObjectId
    permissions: mongoose.Types.ObjectId[]
    viewToken: string | null
    lock: ILock | null
}

const baseOptions = {
    discriminatorKey: 'type',
    timestamps: true
}

const documentSchema: Schema = new Schema(
    {
        name: {
            type: String,
            required: true
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
        },
        viewToken: {
            type: String,
            default: null
        },
        lock: {
            type: {
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                    required: true
                },
                lockTime: {
                    type: Date,
                    required: true
                }
            },
            default: null
        },
        type: {
            type: String,
            required: true,
            enum: ['TextDocument', 'PresentationDocument']
        }
    },
    baseOptions
)

const DocumentModel: mongoose.Model<IDocument> = mongoose.model<IDocument>('Document', documentSchema)

export { DocumentModel, IDocument }
