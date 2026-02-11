"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const uuid_1 = require("uuid");
const auth_1 = require("../middleware/auth");
const TextDocument_1 = require("../models/TextDocument");
const User_1 = require("../models/User");
const mongoose_1 = __importDefault(require("mongoose"));
const router = (0, express_1.Router)();
const LOCK_TIMEOUT = 2 * 60 * 1000;
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
router.get('/:id', auth_1.verifyToken, async (request, response) => {
    try {
        const id = Array.isArray(request.params.id) ? request.params.id[0] : request.params.id;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            response.status(404).json({ error: 'Text document not found' });
            return;
        }
        const textDocument = await TextDocument_1.TextDocument.findOne({
            _id: id,
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
router.put('/:id', auth_1.verifyToken, async (request, response) => {
    try {
        const { name, text } = request.body;
        if (!name) {
            response.status(400).json({ error: 'Text document must have a name' });
            return;
        }
        const updatedTextDocument = await TextDocument_1.TextDocument.findOneAndUpdate({
            _id: request.params.id,
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
router.put('/:id/permissions/view', auth_1.verifyToken, async (request, response) => {
    try {
        const updatedTextDocument = await TextDocument_1.TextDocument.findOne({
            _id: request.params.id,
            user: request.user?.id
        });
        if (!updatedTextDocument) {
            response.status(404).json({ error: 'Text document not found' });
            return;
        }
        if (updatedTextDocument.viewToken) {
            response.status(400).json({ error: 'This text document already has a view link' });
            return;
        }
        const viewToken = (0, uuid_1.v4)();
        updatedTextDocument.viewToken = viewToken;
        await updatedTextDocument.save();
        response.status(200).json(viewToken);
    }
    catch (error) {
        response.status(500).json({ error: 'Error creating share view link' });
    }
});
router.get('/:uuid/view', async (request, response) => {
    try {
        const textDocument = await TextDocument_1.TextDocument.findOne({
            viewToken: request.params.uuid
        });
        if (!textDocument) {
            response.status(400).json({ error: 'Text document not found' });
            return;
        }
        response.status(200).json(textDocument);
    }
    catch (error) {
        response.status(500).json({ error: 'Error fetching text document' });
    }
});
router.put('/:id/lock', auth_1.verifyToken, async (request, response) => {
    try {
        const textDocument = await TextDocument_1.TextDocument.findOne({
            _id: request.params.id,
            $or: [
                { user: request.user?.id },
                { permissions: request.user?.id }
            ]
        });
        if (!textDocument) {
            response.status(404).json({ error: 'Text document not found' });
            return;
        }
        if (textDocument.lock) {
            const expired = Date.now() - textDocument.lock.lockTime.getTime() > LOCK_TIMEOUT;
            if (!expired && textDocument.lock.user.toString() !== request.user?.id) {
                response.status(409).json({ error: 'Text document is currently locked by another user' });
                return;
            }
        }
        textDocument.lock = {
            user: request.user?.id,
            lockTime: new Date(Date.now())
        };
        await textDocument.save();
        response.status(200).json(textDocument);
    }
    catch (error) {
        response.status(500).json({ error: 'Error adding lock' });
    }
});
router.delete('/:id/lock', auth_1.verifyToken, async (request, response) => {
    try {
        const textDocument = await TextDocument_1.TextDocument.findOne({
            _id: request.params.id,
            $or: [
                { user: request.user?.id },
                { permissions: request.user?.id }
            ]
        });
        if (!textDocument) {
            response.status(404).json({ error: 'Text document not found' });
            return;
        }
        if (!textDocument.lock) {
            response.status(400).json({ error: 'Text document is not locked' });
            return;
        }
        if (textDocument.lock.user.toString() !== request.user?.id) {
            response.status(403).json({ error: 'You do not own the text document lock' });
            return;
        }
        textDocument.lock = null;
        await textDocument.save();
        response.status(200).json({ message: 'Text document lock released successfully' });
    }
    catch (error) {
        response.status(500).json({ error: 'Error releasing text document lock' });
    }
});
exports.default = router;
