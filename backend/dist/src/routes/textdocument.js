"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const TextDocument_1 = require("../models/TextDocument");
const User_1 = require("../models/User");
const router = (0, express_1.Router)();
router.get('/', auth_1.verifyToken, async (request, response) => {
    try {
        const ownedTextDocs = await TextDocument_1.TextDocument.find({
            user: request.user?.id
        });
        const sharedTextDocs = await TextDocument_1.TextDocument.find({
            permissions: request.user?.id
        }).populate('user', 'id username');
        response.status(200).json({
            ownedTextDocs,
            sharedTextDocs
        });
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
        const updatedTextDocument = await TextDocument_1.TextDocument.findOneAndUpdate({
            _id: request.params.id,
            $or: [
                { user: request.user?.id },
                { permissions: request.user?.id }
            ]
        }, { name: name, text: text }, { new: true });
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
router.put('/:id/permissions', auth_1.verifyToken, async (request, response) => {
    try {
        if (!request.body.userId) {
            response.status(400).json({ error: 'User id is required to grant edit permission' });
            return;
        }
        if (request.body.userId === request.user?.id) {
            response.status(400).json({ error: 'You cannot grant edit permission to yourself' });
            return;
        }
        const userExists = await User_1.User.findById(request.body.userId);
        if (!userExists) {
            response.status(404).json({ error: 'User not found' });
            return;
        }
        const textDocument = await TextDocument_1.TextDocument.findOne({
            _id: request.params.id,
            user: request.user?.id
        });
        if (!textDocument) {
            response.status(404).json({ error: 'Text document not found' });
            return;
        }
        if (textDocument.permissions.includes(request.body.userId)) {
            response.status(400).json({ error: 'This user already has permission to edit the text document' });
            return;
        }
        textDocument.permissions.push(request.body.userId);
        await textDocument.save();
        response.status(200).json({ message: 'User has been granted edit permission successfully' });
    }
    catch (error) {
        response.status(500).json({ error: 'Error updating permissions' });
    }
});
exports.default = router;
