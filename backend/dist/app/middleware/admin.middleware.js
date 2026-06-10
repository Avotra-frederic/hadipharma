"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminOnly = void 0;
const jwt_utils_1 = require("../../utils/jwt.utils");
const user_service_1 = __importDefault(require("../../services/user.service"));
const adminOnly = async (req, res, next) => {
    const { auth_token } = req.cookies;
    if (!auth_token) {
        res.status(401).json({ message: "Authentication required" });
        return;
    }
    try {
        const decoded = (0, jwt_utils_1.verifyToken)(auth_token);
        const user = await user_service_1.default.findUser(decoded._id);
        // Check if user is an admin or pharmacist
        if (user?.role !== 'admin' && user?.role !== 'pharmacist') {
            res.status(403).json({ message: "Access denied: Admin privileges required" });
            return;
        }
        req.user = decoded;
        next();
    }
    catch (error) {
        res.status(401).json({ message: "Invalid token" });
    }
};
exports.adminOnly = adminOnly;
