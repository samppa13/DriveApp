"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const db_1 = __importDefault(require("./src/config/db"));
const user_1 = __importDefault(require("./src/routes/user"));
const document_1 = __importDefault(require("./src/routes/document"));
const textdocument_1 = __importDefault(require("./src/routes/textdocument"));
const presentationdocument_1 = __importDefault(require("./src/routes/presentationdocument"));
const spreadsheetdocument_1 = __importDefault(require("./src/routes/spreadsheetdocument"));
const image_1 = __importDefault(require("./src/routes/image"));
dotenv_1.default.config();
(0, db_1.default)();
const app = (0, express_1.default)();
const port = 9000;
const corsOptions = {
    origin: 'http://localhost:5173',
    optionsSuccessStatus: 200
};
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.use('/api/users', user_1.default);
app.use('/api/documents', document_1.default);
app.use('/api/textdocuments', textdocument_1.default);
app.use('/api/presentationdocuments', presentationdocument_1.default);
app.use('/api/spreadsheetdocuments', spreadsheetdocument_1.default);
app.use('/api/images', image_1.default);
// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
