"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PresentationDocumentModel = void 0;
const mongoose_1 = require("mongoose");
const Document_1 = require("./Document");
// Define the schema for a PresentationDocument
const presentationDocumentSchema = new mongoose_1.Schema({
    slides: [{
            title: {
                type: String,
                required: true
            },
            bullets: {
                type: [String],
                default: []
            }
        }]
});
// Define PresentationDocument model using discriminator
const PresentationDocumentModel = Document_1.DocumentModel.discriminator('PresentationDocument', presentationDocumentSchema);
exports.PresentationDocumentModel = PresentationDocumentModel;
