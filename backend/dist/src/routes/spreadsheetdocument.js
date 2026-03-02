"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const mongoose_1 = __importDefault(require("mongoose"));
const Spreadsheet_1 = require("../models/document/Spreadsheet");
const router = (0, express_1.Router)();
// Create a new spreadsheet document
router.post('/', auth_1.verifyToken, async (request, response) => {
    try {
        const { name, cells } = request.body;
        const userId = request.user?.id;
        if (!name) {
            response.status(400).json({ error: 'Document must have a name' });
            return;
        }
        const newSpreadsheetDocument = new Spreadsheet_1.SpreadsheetDocumentModel({
            name,
            cells,
            user: userId
        });
        await newSpreadsheetDocument.save();
        response.status(200).json(newSpreadsheetDocument);
    }
    catch (error) {
        response.status(500).json({ error: 'Error creating spreadsheet document' });
    }
});
// Get a spreadsheet document by ID
router.get('/:id', auth_1.verifyToken, async (request, response) => {
    try {
        const id = Array.isArray(request.params.id) ? request.params.id[0] : request.params.id;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            response.status(404).json({ error: 'Spreadsheet document not found' });
            return;
        }
        const spreadsheetDocument = await Spreadsheet_1.SpreadsheetDocumentModel.findOne({
            _id: id,
            isDeleted: false,
            $or: [
                { user: request.user?.id },
                { permissions: request.user?.id }
            ]
        });
        if (!spreadsheetDocument) {
            response.status(404).json({ error: 'Spreadsheet document not found' });
            return;
        }
        response.json(spreadsheetDocument);
    }
    catch (error) {
        response.status(500).json({ error: 'Error fetching spreadsheet document' });
    }
});
// Update a spreadsheet document by ID
router.put('/:id', auth_1.verifyToken, async (request, response) => {
    try {
        const { name, cells } = request.body;
        if (!name) {
            response.status(400).json({ error: 'Spreadsheet document must have a name' });
            return;
        }
        const updatedSpreadsheetDocument = await Spreadsheet_1.SpreadsheetDocumentModel.findOneAndUpdate({
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
        }, { name, cells }, { new: true });
        if (!updatedSpreadsheetDocument) {
            response.status(404).json({ error: 'Spreadsheet document is locked by another user or does not found' });
            return;
        }
        response.json(updatedSpreadsheetDocument);
    }
    catch (error) {
        response.status(500).json({ error: 'Error updating spreadsheet document' });
    }
});
// Get a spreadsheet document by view token (public view)
router.get('/:uuid/view', async (request, response) => {
    try {
        const spreadsheetDocument = await Spreadsheet_1.SpreadsheetDocumentModel.findOne({
            viewToken: request.params.uuid,
            isDeleted: false
        });
        if (!spreadsheetDocument) {
            response.status(400).json({ error: 'Document not found' });
            return;
        }
        response.status(200).json(spreadsheetDocument);
    }
    catch (error) {
        response.status(500).json({ error: 'Error fetching spreadsheet document' });
    }
});
exports.default = router;
