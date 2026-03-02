"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageModel = void 0;
const mongoose_1 = require("mongoose");
const Document_1 = require("./Document");
// Define the schema for a Image
const imageSchema = new mongoose_1.Schema({
    path: {
        type: String,
        required: true
    },
    originalName: {
        type: String,
        required: true
    }
});
// Define Image model using discriminator from DocumentModel
const ImageModel = Document_1.DocumentModel.discriminator('Image', imageSchema);
exports.ImageModel = ImageModel;
