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
const router = (0, express_1.Router)();
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
router.get('/', auth_1.verifyToken, async (request, response) => {
    try {
        const users = await User_1.User.find().select('-password');
        return response.status(200).json(users);
    }
    catch (error) {
        response.status(500).json({ error: 'Error while fetching users' });
    }
});
exports.default = router;
