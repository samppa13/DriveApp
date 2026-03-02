"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const auth_1 = require("../middleware/auth");
const multer_config_1 = __importDefault(require("../middleware/multer-config"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const router = (0, express_1.Router)();
// Register a new user
router.post('/register', async (request, response) => {
    try {
        const { username, password } = request.body;
        if (!username || !password) {
            response.status(400).json({ error: 'Please fill in all fields' });
            return;
        }
        const existingUser = await User_1.User.findOne({ username });
        if (existingUser) {
            response.status(400).json({ error: 'Username is already taken' });
            return;
        }
        const salt = await bcryptjs_1.default.genSalt(10);
        const hashedPassword = await bcryptjs_1.default.hash(password, salt);
        await User_1.User.create({
            username: username,
            password: hashedPassword
        });
        response.status(200).json({ message: 'User registered successfully' });
    }
    catch (error) {
        response.status(500).json({ error: 'Error registering user' });
    }
});
// Login a user and return a JWT token
router.post('/login', async (request, response) => {
    try {
        const { username, password } = request.body;
        if (!username || !password) {
            response.status(400).json({ error: 'Please enter username and password' });
            return;
        }
        const user = await User_1.User.findOne({ username });
        if (!user || !(await bcryptjs_1.default.compare(password, user.password))) {
            response.status(400).json({ error: 'Incorrect username or password' });
            return;
        }
        const jwtPayload = {
            id: user._id,
            username: user.username
        };
        const token = jsonwebtoken_1.default.sign(jwtPayload, process.env.SECRET, { expiresIn: '7d' });
        response.status(200).json({ token });
    }
    catch (error) {
        response.status(500).json({ error: 'Error logging in' });
    }
});
// Get all users (without passwords)
router.get('/', auth_1.verifyToken, async (request, response) => {
    try {
        const users = await User_1.User.find().select('-password');
        return response.status(200).json(users);
    }
    catch (error) {
        response.status(500).json({ error: 'Error while fetching users' });
    }
});
// Get logged-in user's profile image file
router.get('/profile/image/file', auth_1.verifyToken, async (request, response) => {
    try {
        const user = await User_1.User.findById(request.user?.id);
        if (!user) {
            response.status(404).json({ error: 'User not found' });
            return;
        }
        if (!user.profileImage) {
            response.status(403).json({ error: 'Profile image not found' });
            return;
        }
        const imagesDir = path_1.default.resolve(__dirname, `../../../public/images/${user._id}`);
        const imgPath = path_1.default.resolve(imagesDir, user.profileImage);
        if (!imgPath.startsWith(imagesDir)) {
            response.status(400).json({ error: 'Invalid path' });
            return;
        }
        try {
            await fs_1.default.promises.access(imgPath);
        }
        catch (error) {
            response.status(404).json({ error: 'File missing on server' });
            return;
        }
        response.sendFile(imgPath);
    }
    catch (error) {
        response.status(500).json({ error: 'Error feching image' });
    }
});
// Upload a new profile image for logged-in user
router.post('/profile/image/upload', auth_1.verifyToken, multer_config_1.default.single('image'), async (request, response) => {
    try {
        if (!request.file) {
            response.status(400).json({ error: 'No image uploaded' });
            return;
        }
        const user = await User_1.User.findById(request.user?.id);
        if (!user) {
            response.status(404).json({ error: 'User not found' });
            return;
        }
        if (user.profileImage) {
            const oldPath = path_1.default.join(__dirname, `../../../public/images/${user._id}/${user.profileImage}`);
            try {
                await fs_1.default.promises.unlink(oldPath);
            }
            catch { }
        }
        user.profileImage = request.file.filename;
        await user.save();
        response.status(200).json({ message: 'Profile image updated successfully', filename: request.file.filename });
    }
    catch (error) {
        response.status(500).json({ error: 'Error uploading image' });
    }
});
// Delete logged-in user's profile image
router.delete('/profile/image', auth_1.verifyToken, async (request, response) => {
    try {
        const user = await User_1.User.findById(request.user?.id);
        if (!user) {
            response.status(404).json({ error: 'User not found' });
            return;
        }
        if (!user.profileImage) {
            response.status(400).json({ error: 'Profile image not found' });
            return;
        }
        const imgPath = path_1.default.join(__dirname, `../../../public/images/${user._id}/${user.profileImage}`);
        try {
            await fs_1.default.promises.unlink(imgPath);
        }
        catch { }
        user.profileImage = null;
        await user.save();
        response.status(200).json({ message: 'Profile image deleted successfully' });
    }
    catch (error) {
        response.status(500).json({ error: 'Error deleting profile image' });
    }
});
// Get logged-in user's profile information
router.get('/profile', auth_1.verifyToken, async (request, response) => {
    try {
        const user = await User_1.User.findById(request.user?.id).select('-password');
        if (!user) {
            response.status(404).json({ error: 'User not found' });
            return;
        }
        response.status(200).json(user);
    }
    catch (error) {
        response.status(500).json({ error: 'Error fetching profile' });
    }
});
// Update logged-in user's profile information
router.put('/profile', auth_1.verifyToken, async (request, response) => {
    try {
        const { username } = request.body;
        if (!username) {
            response.status(400).json({ error: 'Please enter username' });
            return;
        }
        const existingUser = await User_1.User.findOne({ username });
        if (existingUser && existingUser._id !== request.user?.id) {
            response.status(400).json({ error: 'Username is already taken' });
            return;
        }
        const user = await User_1.User.findByIdAndUpdate(request.user?.id, { username }, { new: true });
        if (!user) {
            response.status(404).json({ error: 'User not found' });
            return;
        }
        response.status(200).json({ message: 'Profile updated successfully', username: user.username });
    }
    catch (error) {
        response.status(500).json({ error: 'Error updating profile' });
    }
});
exports.default = router;
