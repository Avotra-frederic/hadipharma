import { Router } from "express";
import { authenticate, checkEmailAvailability, deleteUser, findUser, logout, me, register, updateUser } from "../app/controller/user.controller";
import { getOrdersByUser } from "../app/controller/pharmacy-order.controller";
import { auth } from "../app/middleware/auth.middleware";
import { guest } from "../app/middleware/auth.middleware";

const userRouter = Router();
userRouter.post("/register", guest, register);
userRouter.post("/login", guest, authenticate);
userRouter.post("/logout", logout);
userRouter.get("/me", me);
userRouter.get("/check-email", checkEmailAvailability);
userRouter.get("/:userId/orders", auth, getOrdersByUser);
userRouter.get("/:id", findUser);
userRouter.put("/:id", updateUser);
userRouter.delete("/:id", deleteUser);

export default userRouter;