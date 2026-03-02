"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const Text_1 = require("../models/document/Text");
const mongoose_1 = __importDefault(require("mongoose"));
const router = (0, express_1.Router)();
// Create a new text document
router.post('/', auth_1.verifyToken, async (request, response) => {
    try {
        const { name, text } = request.body;
        const userId = request.user?.id;
        if (!name) {
            response.status(400).json({ error: 'Document must have a name' });
            return;
        }
        const newTextDocument = new Text_1.TextDocumentModel({
            name,
            text,
            user: userId
        });
        await newTextDocument.save();
        response.status(200).json(newTextDocument);
    }
    catch (error) {
        response.status(500).json({ error: 'Error creating text document' });
    }
});
// Get a text document by ID
router.get('/:id', auth_1.verifyToken, async (request, response) => {
    try {
        const id = Array.isArray(request.params.id) ? request.params.id[0] : request.params.id;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            response.status(404).json({ error: 'Text document not found' });
            return;
        }
        const textDocument = await Text_1.TextDocumentModel.findOne({
            _id: id,
            isDeleted: false,
            $or: [
                { user: request.user?.id },
                { permissions: request.user?.id }
            ]
        });
        if (!textDocument) {
            response.status(404).json({ error: 'Text document not found' });
            return;
        }
        response.json(textDocument);
    }
    catch (error) {
        response.status(500).json({ error: 'Error fetching text document' });
    }
});
// Update a text document by ID
router.put('/:id', auth_1.verifyToken, async (request, response) => {
    try {
        const { name, text } = request.body;
        if (!name) {
            response.status(400).json({ error: 'Text document must have a name' });
            return;
        }
        const updatedTextDocument = await Text_1.TextDocumentModel.findOneAndUpdate({
            _id: request.params.id,
            isDeleted: false,
            $and: [
                {
                    $or: [
                        { user: request.user?.id },
                        { permissions: request.user?.id }
                    ]
                },
                {
                    $or: [
                        { lock: null },
                        { 'lock.user': request.user?.id }
                    ]
                }
            ]
        }, { name, text }, { new: true });
        if (!updatedTextDocument) {
            response.status(404).json({ error: 'Text document is locked by another user or does not found' });
            return;
        }
        response.json(updatedTextDocument);
    }
    catch (error) {
        response.status(500).json({ error: 'Error updating text document' });
    }
});
// Get a text document by view token (public view)
router.get('/:uuid/view', async (request, response) => {
    try {
        const textDocument = await Text_1.TextDocumentModel.findOne({
            viewToken: request.params.uuid,
            isDeleted: false
        });
        if (!textDocument) {
            response.status(400).json({ error: 'Document not found' });
            return;
        }
        response.status(200).json(textDocument);
    }
    catch (error) {
        response.status(500).json({ error: 'Error fetching text document' });
    }
});
exports.default = router;
