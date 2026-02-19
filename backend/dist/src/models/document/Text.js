"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextDocumentModel = void 0;
const mongoose_1 = require("mongoose");
const Document_1 = require("./Document");
const textDocumentSchema = new mongoose_1.Schema({
    text: {
        type: String,
        default: ''
    }
});
const TextDocumentModel = Document_1.DocumentModel.discriminator('TextDocument', textDocumentSchema);
exports.TextDocumentModel = TextDocumentModel;
