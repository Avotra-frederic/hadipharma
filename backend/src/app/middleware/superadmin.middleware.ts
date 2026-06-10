import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../../utils/jwt.utils";
import User from "../../app/model/user.model";
import { auth } from "./auth.middleware";

const superAdminOnly = async(req: Request, res: Response, next: NextFunction) => {
    const { auth_token } = req.cookies;
    
    if (!auth_token) {
        res.status(401).json({ message: "Authentication required" });
        return;
    }

    try {
        const decoded: any = verifyToken(auth_token as string);
        const user = await User.findById(decoded._id);
        
        if (!user || user.role !== 'superadmin') {
            res.status(403).json({ message: "Access denied: Super admin privileges required" });
            return;
        }
        
        req.user = decoded as any;
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid token" });
    }
};

export { superAdminOnly };
