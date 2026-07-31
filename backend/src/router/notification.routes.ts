import { Router } from "express";
import { auth } from "../app/middleware/auth.middleware";
import { verifyToken } from "../utils/jwt.utils";
import Notification from "../app/model/notification.model";

const notificationRouter = Router();

notificationRouter.use(auth);

const getUserId = (req: any) => (verifyToken(req.cookies.auth_token) as any)._id;

notificationRouter.get("/", async (req, res) => {
    const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 100);
    const notifications = await Notification.find({ user: getUserId(req) }).sort({ createdAt: -1 }).limit(limit).lean();
    res.json({ notifications: notifications.map((item: any) => ({
        id: item._id.toString(), type: item.type, title: item.title, message: item.message,
        userId: item.user.toString(), pharmacyId: item.pharmacy?.toString(), metadata: item.metadata,
        read: item.read, createdAt: item.createdAt,
    })) });
});

notificationRouter.put("/:id/read", async (req, res) => {
    await Notification.findOneAndUpdate({ _id: req.params.id, user: getUserId(req) }, { read: true });
    res.json({ message: 'Notification marked as read' });
});

notificationRouter.put("/read-all", async (req, res) => {
    await Notification.updateMany({ user: getUserId(req), read: false }, { read: true });
    res.json({ message: 'Notifications marked as read' });
});

export default notificationRouter;
