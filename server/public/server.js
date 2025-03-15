"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_route_1 = __importDefault(require("./routes/auth/auth-route"));
const admin_route_1 = __importDefault(require("./routes/admin/admin-route"));
const user_route_1 = __importDefault(require("./routes/user/user-route"));
const body_parser_1 = __importDefault(require("body-parser"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.use('/api', (0, cors_1.default)({
    credentials: true,
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control', 'Expires', 'Pragma', 'X-Requested-With'],
}));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json({ limit: '50mb' }));
app.use(express_1.default.urlencoded({ limit: '50mb', extended: true }));
app.use(body_parser_1.default.urlencoded({ limit: '50mb', extended: true, parameterLimit: 50000 }));
app.use(body_parser_1.default.json({ limit: '50mb' }));
app.use('/api/auth', auth_route_1.default);
app.use('/api/admin', admin_route_1.default);
app.use('/api/user', user_route_1.default);
app.use(express_1.default.static(path_1.default.join(__dirname, "dist")));
app.get("*", (_, res) => {
    res.sendFile(path_1.default.join(__dirname, "dist", "index.html"));
});
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});