"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpreadsheetDocumentModel = void 0;
const mongoose_1 = require("mongoose");
const Document_1 = require("./Document");
// Define the schema for a SpreadsheetDocument
const spreadsheetDocumentSchema = new mongoose_1.Schema({
    cells: {
        type: [[String]],
        default: [[]]
    }
});
// Define SpreadsheetDocument model using discriminator
const SpreadsheetDocumentModel = Document_1.DocumentModel.discriminator('SpreadsheetDocument', spreadsheetDocumentSchema);
exports.SpreadsheetDocumentModel = SpreadsheetDocumentModel;
