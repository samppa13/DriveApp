"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const fs_1 = __importDefault(require("fs"));
const auth_1 = require("../middleware/auth");
const Image_1 = require("../models/document/Image");
const multer_config_1 = __importDefault(require("../middleware/multer-config"));
const path_1 = __importDefault(require("path"));
const router = (0, express_1.Router)();
// Get a single image metadata by ID
router.get('/:id', auth_1.verifyToken, async (request, response) => {
    try {
        const image = await Image_1.ImageModel.findOne({
            _id: request.params.id,
            isDeleted: false,
            $or: [
                { user: request.user?.id },
                { permissions: request.user?.id }
            ]
        });
        if (!image) {
            response.status(404).json({ error: 'Image not found' });
            return;
        }
        response.status(200).json(image);
    }
    catch (error) {
        response.status(500).json({ error: 'Error fetching image' });
    }
});
// Download the actual image file by ID
router.get('/:id/file', auth_1.verifyToken, async (request, response) => {
    try {
        const image = await Image_1.ImageModel.findOne({
            _id: request.params.id,
            isDeleted: false,
            $or: [
                { user: request.user?.id },
                { permissions: request.user?.id }
            ]
        });
        if (!image) {
            response.status(404).json({ error: 'Image not found' });
            return;
        }
        const imagesDir = path_1.default.resolve(__dirname, `../../../public/images/${image.user}`);
        const filePath = path_1.default.resolve(imagesDir, image.name);
        if (!filePath.startsWith(imagesDir)) {
            response.status(400).json({ error: 'Invalid path' });
            return;
        }
        if (!fs_1.default.existsSync(filePath)) {
            response.status(404).json({ error: 'File missing on server' });
            return;
        }
        response.sendFile(filePath);
    }
    catch (error) {
        response.status(500).json({ error: 'Error feching image' });
    }
});
// Upload a new image file
router.post('/upload', auth_1.verifyToken, multer_config_1.default.single('image'), async (request, response) => {
    try {
        if (!request.file) {
            response.status(400).json({ error: 'No file uploaded' });
            return;
        }
        const imgPath = request.file.path.replace('public', '');
        const image = new Image_1.ImageModel({
            name: request.file.filename,
            path: imgPath,
            user: request.user?.id,
            originalName: request.file.originalname
        });
        await image.save();
        response.status(201).json({ message: 'File uploaded and saved in the database' });
    }
    catch (error) {
        response.status(500).json({ error: 'Error uploading image' });
    }
});
exports.default = router;
