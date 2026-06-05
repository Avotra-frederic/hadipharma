import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../../utils/jwt.utils";
import IUser from "../interface/user.interface";
import userService from "../../services/user.service";

declare global {
    namespace Express {
        interface Request {
            user?: IUser;
        }
    }
}

const adminOnly = async(req: Request, res: Response, next: NextFunction) => {
    const { auth_token } = req.cookies;
    
    if (!auth_token) {
        res.status(401).json({ message: "Authentication required" });
        return;
    }

    try {
        const decoded = verifyToken(auth_token as string) as IUser;

        const user = await userService.findUser(decoded._id as unknown as string);
        
        
        // Check if user is an admin or pharmacist
        if (user?.role !== 'admin') {
            res.status(403).json({ message: "Access denied: Admin privileges required" });
            return;
        }
        
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid token" });
    }
};

export { adminOnly };