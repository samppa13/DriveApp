"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
// Connect to MongoDB and handle connection errors
const connectDB = () => {
    const mongoDB = process.env.MONGO_URI;
    mongoose_1.default.connect(mongoDB);
    mongoose_1.default.Promise = Promise;
    const db = mongoose_1.default.connection;
    db.on('error', console.error.bind(console, 'MongoDB connection error'));
};
exports.default = connectDB;
