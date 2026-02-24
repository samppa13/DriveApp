import mongoose, { Schema } from 'mongoose'
import { DocumentModel, IDocument } from './Document'

interface ISpreadsheetDocument extends IDocument {
    type: 'SpreadsheetDocument'
    cells: string[][]
}

const spreadsheetDocumentSchema: Schema = new Schema({
    cells: {
        type: [[String]],
        default: [[]]
    }
})

const SpreadsheetDocumentModel: mongoose.Model<ISpreadsheetDocument> = DocumentModel.discriminator<ISpreadsheetDocument>('SpreadsheetDocument', spreadsheetDocumentSchema)

export { SpreadsheetDocumentModel, ISpreadsheetDocument }
