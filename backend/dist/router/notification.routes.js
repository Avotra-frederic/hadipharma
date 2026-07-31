"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../app/middleware/auth.middleware");
const jwt_utils_1 = require("../utils/jwt.utils");
const notification_model_1 = __importDefault(require("../app/model/notification.model"));
const notificationRouter = (0, express_1.Router)();
notificationRouter.use(auth_middleware_1.auth);
const getUserId = (req) => (0, jwt_utils_1.verifyToken)(req.cookies.auth_token)._id;
notificationRouter.get("/", async (req, res) => {
    const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 100);
    const notifications = await notification_model_1.default.find({ user: getUserId(req) }).sort({ createdAt: -1 }).limit(limit).lean();
    res.json({ notifications: notifications.map((item) => ({
            id: item._id.toString(), type: item.type, title: item.title, message: item.message,
            userId: item.user.toString(), pharmacyId: item.pharmacy?.toString(), metadata: item.metadata,
            read: item.read, createdAt: item.createdAt,
        })) });
});
notificationRouter.put("/:id/read", async (req, res) => {
    await notification_model_1.default.findOneAndUpdate({ _id: req.params.id, user: getUserId(req) }, { read: true });
    res.json({ message: 'Notification marked as read' });
});
notificationRouter.put("/read-all", async (req, res) => {
    await notification_model_1.default.updateMany({ user: getUserId(req), read: false }, { read: true });
    res.json({ message: 'Notifications marked as read' });
});
exports.default = notificationRouter;
