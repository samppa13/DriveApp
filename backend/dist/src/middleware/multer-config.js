"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
const fs_1 = __importDefault(require("fs"));
// Configure Multer to handle image uploads
// and store them in a user-specific folder with a unique filename
const storage = multer_1.default.diskStorage({
    destination: async (request, file, callback) => {
        const userDir = path_1.default.join('./public/images', request.user?.id);
        try {
            await fs_1.default.promises.access(userDir);
        }
        catch (error) {
            await fs_1.default.promises.mkdir(userDir, { recursive: true });
        }
        callback(null, userDir);
    },
    filename: (request, file, callback) => {
        const originalname = path_1.default.parse(file.originalname).name;
        const id = (0, uuid_1.v4)();
        const extension = path_1.default.extname(file.originalname);
        callback(null, `${originalname}_${id}${extension}`);
    }
});
const upload = (0, multer_1.default)({ storage: storage });
exports.default = upload;
