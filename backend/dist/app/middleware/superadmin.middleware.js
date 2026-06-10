"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.superAdminOnly = void 0;
const jwt_utils_1 = require("../../utils/jwt.utils");
const user_model_1 = __importDefault(require("../../app/model/user.model"));
const superAdminOnly = async (req, res, next) => {
    const { auth_token } = req.cookies;
    if (!auth_token) {
        res.status(401).json({ message: "Authentication required" });
        return;
    }
    try {
        const decoded = (0, jwt_utils_1.verifyToken)(auth_token);
        const user = await user_model_1.default.findById(decoded._id);
        if (!user || user.role !== 'superadmin') {
            res.status(403).json({ message: "Access denied: Super admin privileges required" });
            return;
        }
        req.user = decoded;
        next();
    }
    catch (error) {
        res.status(401).json({ message: "Invalid token" });
    }
};
exports.superAdminOnly = superAdminOnly;
