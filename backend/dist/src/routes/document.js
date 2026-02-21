"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const uuid_1 = require("uuid");
const auth_1 = require("../middleware/auth");
const User_1 = require("../models/User");
const Document_1 = require("../models/document/Document");
const router = (0, express_1.Router)();
const LOCK_TIMEOUT = 2 * 60 * 1000;
router.get('/', auth_1.verifyToken, async (request, response) => {
    try {
        const ownedDocs = await Document_1.DocumentModel.find({
            user: request.user?.id,
            isDeleted: false
        });
        const sharedDocs = await Document_1.DocumentModel.find({
            permissions: request.user?.id,
            isDeleted: false
        }).populate('user', 'id username');
        response.status(200).json({
            ownedDocs,
            sharedDocs
        });
    }
    catch (error) {
        response.status(500).json({ error: 'Error fetching documents' });
    }
});
router.get('/trash', auth_1.verifyToken, async (request, response) => {
    try {
        const documents = await Document_1.DocumentModel.find({
            user: request.user?.id,
            isDeleted: true
        });
        response.status(200).json(documents);
    }
    catch (error) {
        response.status(500).json({ error: 'Error fetching trash' });
    }
});
router.post('/trash/restore', auth_1.verifyToken, async (request, response) => {
    try {
        await Document_1.DocumentModel.updateMany({
            user: request.user?.id,
            isDeleted: true
        }, { isDeleted: false });
        response.status(200).json({ message: 'Documents restored successfully' });
    }
    catch (error) {
        response.status(500).json({ error: 'Error restoring documents' });
    }
});
router.delete('/trash/empty', auth_1.verifyToken, async (request, response) => {
    try {
        await Document_1.DocumentModel.deleteMany({
            user: request.user?.id,
            isDeleted: true
        });
        response.status(200).json({ message: 'Trash emptied successfully' });
    }
    catch (error) {
        response.status(500).json({ error: 'Error emptying trash' });
    }
});
router.delete('/:id', auth_1.verifyToken, async (request, response) => {
    try {
        const updatedDocument = await Document_1.DocumentModel.findOneAndUpdate({
            _id: request.params.id,
            user: request.user?.id,
            isDeleted: false
        }, { isDeleted: true }, { new: true });
        if (!updatedDocument) {
            response.status(404).json({ error: 'Document not found' });
            return;
        }
        response.status(200).json({ message: 'Document moved to trash successfully' });
    }
    catch (error) {
        response.status(500).json({ error: 'Error deleting document' });
    }
});
router.delete('/:id/permanent', auth_1.verifyToken, async (request, response) => {
    try {
        const document = await Document_1.DocumentModel.findOneAndDelete({
            _id: request.params.id,
            user: request.user?.id,
            isDeleted: true
        });
        if (!document) {
            response.status(404).json({ error: 'Document not found' });
            return;
        }
        response.status(200).json({ message: 'Document deleted successfully' });
    }
    catch (error) {
        response.status(500).json({ error: 'Error deleting document' });
    }
});
router.post('/:id/restore', auth_1.verifyToken, async (request, response) => {
    try {
        const updatedDocument = await Document_1.DocumentModel.findOneAndUpdate({
            _id: request.params.id,
            user: request.user?.id,
            isDeleted: true
        }, { isDeleted: false }, { new: true });
        if (!updatedDocument) {
            response.status(404).json({ error: 'Document not found' });
            return;
        }
        response.status(200).json(updatedDocument);
    }
    catch (error) {
        response.status(500).json({ error: 'Error restoring document' });
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
        const document = await Document_1.DocumentModel.findOne({
            _id: request.params.id,
            user: request.user?.id,
            isDeleted: false
        });
        if (!document) {
            response.status(404).json({ error: 'Document not found' });
            return;
        }
        if (document.permissions.includes(request.body.userId)) {
            response.status(400).json({ error: 'This user already has permission to edit the document' });
            return;
        }
        document.permissions.push(request.body.userId);
        await document.save();
        response.status(200).json({ message: 'User has been granted edit permission successfully' });
    }
    catch (error) {
        response.status(500).json({ error: 'Error updating permissions' });
    }
});
router.put('/:id/permissions/view', auth_1.verifyToken, async (request, response) => {
    try {
        const updatedDocument = await Document_1.DocumentModel.findOne({
            _id: request.params.id,
            user: request.user?.id,
            isDeleted: false
        });
        if (!updatedDocument) {
            response.status(404).json({ error: 'Document not found' });
            return;
        }
        if (updatedDocument.viewToken) {
            response.status(400).json({ error: 'This document already has a view link' });
            return;
        }
        const viewToken = (0, uuid_1.v4)();
        updatedDocument.viewToken = viewToken;
        await updatedDocument.save();
        response.status(200).json(viewToken);
    }
    catch (error) {
        response.status(500).json({ error: 'Error creating share view link' });
    }
});
router.put('/:id/lock', auth_1.verifyToken, async (request, response) => {
    try {
        const document = await Document_1.DocumentModel.findOne({
            _id: request.params.id,
            isDeleted: false,
            $or: [
                { user: request.user?.id },
                { permissions: request.user?.id }
            ]
        });
        if (!document) {
            response.status(404).json({ error: 'Document not found' });
            return;
        }
        if (document.lock) {
            const expired = Date.now() - document.lock.lockTime.getTime() > LOCK_TIMEOUT;
            if (!expired && document.lock.user.toString() !== request.user?.id) {
                response.status(409).json({ error: 'Document is currently locked by another user' });
                return;
            }
        }
        document.lock = {
            user: request.user?.id,
            lockTime: new Date(Date.now())
        };
        await document.save();
        response.status(200).json(document);
    }
    catch (error) {
        response.status(500).json({ error: 'Error adding lock' });
    }
});
router.delete('/:id/lock', auth_1.verifyToken, async (request, response) => {
    try {
        const document = await Document_1.DocumentModel.findOne({
            _id: request.params.id,
            isDeleted: false,
            $or: [
                { user: request.user?.id },
                { permissions: request.user?.id }
            ]
        });
        if (!document) {
            response.status(404).json({ error: 'Document not found' });
            return;
        }
        if (!document.lock) {
            response.status(400).json({ error: 'Document is not locked' });
            return;
        }
        if (document.lock.user.toString() !== request.user?.id) {
            response.status(403).json({ error: 'You do not own the document lock' });
            return;
        }
        document.lock = null;
        await document.save();
        response.status(200).json({ message: 'Document lock released successfully' });
    }
    catch (error) {
        response.status(500).json({ error: 'Error releasing document lock' });
    }
});
exports.default = router;
