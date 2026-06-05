import { NextFunction, Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import { verifyToken } from "../../utils/jwt.utils";

const auth = expressAsyncHandler(async(req:Request, res:Response, next:NextFunction)=>{
    const {auth_token} = req.cookies;
    if(!auth_token) {
        res.status(401).json({message:"Please logged!"});
        return;
    }

    try {
        verifyToken(auth_token as string);
        next();
    } catch (error: any) {
        res.status(401).json({ message: "Token invalid!" });
    }
})


const guest = expressAsyncHandler(async(req:Request, res: Response, next: NextFunction)=>{
    const {auth_token} = req.cookies;

    if(auth_token) {
        res.status(401).json({message:"Access denied"});
        return;
    }
    next();
});

export {auth,guest}