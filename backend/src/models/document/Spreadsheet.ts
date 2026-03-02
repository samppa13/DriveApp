import mongoose, { Schema } from 'mongoose'
import { DocumentModel, IDocument } from './Document'

// Define the interface for a SpreadsheetDocument
interface ISpreadsheetDocument extends IDocument {
    type: 'SpreadsheetDocument'
    cells: string[][]
}

// Define the schema for a SpreadsheetDocument
const spreadsheetDocumentSchema: Schema = new Schema({
    cells: {
        type: [[String]],
        default: [[]]
    }
})

// Define SpreadsheetDocument model using discriminator
const SpreadsheetDocumentModel: mongoose.Model<ISpreadsheetDocument> = DocumentModel.discriminator<ISpreadsheetDocument>('SpreadsheetDocument', spreadsheetDocumentSchema)

export { SpreadsheetDocumentModel, ISpreadsheetDocument }