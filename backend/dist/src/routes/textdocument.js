"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const TextDocument_1 = require("../models/TextDocument");
const router = (0, express_1.Router)();
router.get('/', auth_1.verifyToken, async (request, response) => {
    try {
        const textDocuments = await TextDocument_1.TextDocument.find({ user: request.user?.id });
        response.status(200).json(textDocuments);
    }
    catch (error) {
        response.status(500).json({ error: 'Error fetching text documents' });
    }
});
router.post('/', auth_1.verifyToken, async (request, response) => {
    try {
        const { name, text } = request.body;
        const userId = request.user?.id;
        if (!name) {
            response.status(400).json({ error: 'Document must have a name' });
        }
        const newTextDocument = new TextDocument_1.TextDocument({
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
router.put('/:id', auth_1.verifyToken, async (request, response) => {
    try {
        const { name, text } = request.body;
        if (!name) {
            response.status(400).json({ error: 'Document must have a name' });
        }
        const updatedTextDocument = await TextDocument_1.TextDocument.findOneAndUpdate({ _id: request.params.id, user: request.user?.id }, { name: name, text: text }, { new: true });
        if (!updatedTextDocument) {
            response.status(404).json({ error: 'Text document not found' });
            return;
        }
        response.json(updatedTextDocument);
    }
    catch (error) {
        response.status(500).json({ error: 'Error updating text document' });
    }
});
router.delete('/:id', auth_1.verifyToken, async (request, response) => {
    try {
        const textDocument = await TextDocument_1.TextDocument.findOneAndDelete({
            _id: request.params.id,
            user: request.user?.id
        });
        if (!textDocument) {
            response.status(404).json({ error: 'Text document not found' });
            return;
        }
        response.status(200).json({ message: 'Text document deleted successfully' });
    }
    catch (error) {
        response.status(500).json({ error: 'Error deleting text document' });
    }
});
exports.default = router;
