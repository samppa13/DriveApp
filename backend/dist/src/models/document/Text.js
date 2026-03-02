"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextDocumentModel = void 0;
const mongoose_1 = require("mongoose");
const Document_1 = require("./Document");
// Define the schema for a TextDocument
const textDocumentSchema = new mongoose_1.Schema({
    text: {
        type: String,
        default: ''
    }
});
// Define TextDocument model using discriminator
const TextDocumentModel = Document_1.DocumentModel.discriminator('TextDocument', textDocumentSchema);
exports.TextDocumentModel = TextDocumentModel;
