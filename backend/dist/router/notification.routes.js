"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../app/middleware/auth.middleware");
const notificationRouter = (0, express_1.Router)();
notificationRouter.use(auth_middleware_1.auth);
notificationRouter.get("/", (_req, res) => {
    res.json({ message: "Notifications channel ready" });
});
exports.default = notificationRouter;
