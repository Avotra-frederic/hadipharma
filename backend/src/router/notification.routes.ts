import { Router } from "express";
import { auth } from "../app/middleware/auth.middleware";

const notificationRouter = Router();

notificationRouter.use(auth);

notificationRouter.get("/", (_req, res) => {
    res.json({ message: "Notifications channel ready" });
});

export default notificationRouter;
