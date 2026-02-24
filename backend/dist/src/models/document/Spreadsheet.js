"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpreadsheetDocumentModel = void 0;
const mongoose_1 = require("mongoose");
const Document_1 = require("./Document");
const spreadsheetDocumentSchema = new mongoose_1.Schema({
    cells: {
        type: [[String]],
        default: [[]]
    }
});
const SpreadsheetDocumentModel = Document_1.DocumentModel.discriminator('SpreadsheetDocument', spreadsheetDocumentSchema);
exports.SpreadsheetDocumentModel = SpreadsheetDocumentModel;
