"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const mongoose_1 = __importDefault(require("mongoose"));
const Presentation_1 = require("../models/document/Presentation");
const router = (0, express_1.Router)();
router.post('/', auth_1.verifyToken, async (request, response) => {
    try {
        const { name, slides } = request.body;
        const userId = request.user?.id;
        if (!name) {
            response.status(400).json({ error: 'Document must have a name' });
            return;
        }
        const newPresentationDocument = new Presentation_1.PresentationDocumentModel({
            name,
            slides,
            user: userId
        });
        await newPresentationDocument.save();
        response.status(200).json(newPresentationDocument);
    }
    catch (error) {
        response.status(500).json({ error: 'Error creating presentation document' });
    }
});
router.get('/:id', auth_1.verifyToken, async (request, response) => {
    try {
        const id = Array.isArray(request.params.id) ? request.params.id[0] : request.params.id;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            response.status(404).json({ error: 'Presentation document not found' });
            return;
        }
        const presentationDocument = await Presentation_1.PresentationDocumentModel.findOne({
            _id: id,
            isDeleted: false,
            $or: [
                { user: request.user?.id },
                { permissions: request.user?.id }
            ]
        });
        if (!presentationDocument) {
            response.status(404).json({ error: 'Presentation document not found' });
            return;
        }
        response.json(presentationDocument);
    }
    catch (error) {
        response.status(500).json({ error: 'Error fetching presentation document' });
    }
});
router.put('/:id', auth_1.verifyToken, async (request, response) => {
    try {
        const { name, slides } = request.body;
        if (!name) {
            response.status(400).json({ error: 'Presentation document must have a name' });
            return;
        }
        const updatedPresentationDocument = await Presentation_1.PresentationDocumentModel.findOneAndUpdate({
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
        }, { name, slides }, { new: true });
        if (!updatedPresentationDocument) {
            response.status(404).json({ error: 'Presentation document is locked by another user or does not found' });
            return;
        }
        response.json(updatedPresentationDocument);
    }
    catch (error) {
        response.status(500).json({ error: 'Error updating presentation document' });
    }
});
router.get('/:uuid/view', async (request, response) => {
    try {
        const presentationDocument = await Presentation_1.PresentationDocumentModel.findOne({
            viewToken: request.params.uuid,
            isDeleted: false
        });
        if (!presentationDocument) {
            response.status(400).json({ error: 'Document not found' });
            return;
        }
        response.status(200).json(presentationDocument);
    }
    catch (error) {
        response.status(500).json({ error: 'Error fetching presentation document' });
    }
});
exports.default = router;
