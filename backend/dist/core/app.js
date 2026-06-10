"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const user_routes_1 = __importDefault(require("../router/user.routes"));
const pharmacy_routes_1 = __importDefault(require("../router/pharmacy.routes"));
const admin_routes_1 = __importDefault(require("../router/admin.routes"));
const superadmin_routes_1 = __importDefault(require("../router/superadmin.routes"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const node_path_1 = __importDefault(require("node:path"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)({ origin: true, credentials: true }));
app.use(express_1.default.json({ limit: '10mb' }));
app.use((0, cookie_parser_1.default)());
// Log and detect aborted requests from clients
app.use((req, _res, next) => {
    req.on('aborted', () => {
        console.warn(`Request aborted ${req.method} ${req.originalUrl}`);
    });
    next();
});
app.use("/uploads", express_1.default.static(node_path_1.default.join(__dirname, "..", "..", "uploads")));
app.use("/api/uploads", express_1.default.static(node_path_1.default.join(__dirname, "..", "..", "uploads")));
app.use("/api/auth", user_routes_1.default);
app.use("/api/pharmacy", pharmacy_routes_1.default);
app.use("/api/admin", admin_routes_1.default);
app.use("/api/superadmin", superadmin_routes_1.default);
app.get("/", (req, res) => {
    res.json({ message: "Api is running" });
});
// Global error handler
app.use((err, _req, res, _next) => {
    console.error('Unhandled error:', err && err.stack ? err.stack : err);
    if (err && err.type === 'entity.parse.failed') {
        return res.status(400).json({ message: 'Invalid JSON payload' });
    }
    if (err && err.code === 'ECONNRESET') {
        // client aborted, nothing to do
        return;
    }
    res.status(err?.status || 500).json({ message: err?.message || 'Internal server error' });
});
exports.default = app;
